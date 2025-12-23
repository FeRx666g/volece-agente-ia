from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

import requests

from .models import SolicitudServicio
from .serializers import SolicitudServicioSerializer, DatasetTurnosIASerializer

from django.utils import timezone

from gestion_transporte.models import DatasetTurnosIA
from gestion_vehiculos.models import Vehiculo
from gestion_usuarios.models import Usuario


class CrearSolicitudServicioView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    serializer_class = SolicitudServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)


class ListaSolicitudesClienteView(generics.ListAPIView):
    serializer_class = SolicitudServicioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SolicitudServicio.objects.filter(
            cliente=self.request.user
        ).order_by('-fecha_creacion')


class ListaSolicitudesAdminView(generics.ListAPIView):
    queryset = SolicitudServicio.objects.all().order_by('-fecha_creacion')
    serializer_class = SolicitudServicioSerializer
    permission_classes = [IsAdminUser]  
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['estado', 'cliente']
    search_fields = ['cliente__username']

class SolicitudDetailView(generics.RetrieveUpdateAPIView):
    queryset = SolicitudServicio.objects.all()
    serializer_class = SolicitudServicioSerializer
    permission_classes = [IsAdminUser]

N8N_URL_ASIGNAR_TURNO = "http://localhost:5678/webhook/asignar-turno-ai"
N8N_WEBHOOK_WHATSAPP = "http://localhost:5678/webhook/notificacion-transportista"
 
class AsignarTurnoIAView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser] 

    def post(self, request, *args, **kwargs):
        id_solicitud = request.data.get("id_solicitud")

        if not id_solicitud:
            return Response(
                {"detail": "Falta el campo id_solicitud."},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud = get_object_or_404(SolicitudServicio, pk=id_solicitud)

        if solicitud.estado == 'asignado':
            return Response(
                {"detail": "La solicitud ya fue asignada y no debe enviarse nuevamente a IA."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payload = {
            "id_solicitud": solicitud.id,
            "origen": getattr(solicitud, "origen", None),
            "destino": getattr(solicitud, "destino", None),
            "tipo_vehiculo": getattr(solicitud, "tipo_vehiculo", None),
            "tipo_carga": getattr(solicitud, "tipo_carga", None),
            "fecha_solicitud": getattr(solicitud, "fecha_solicitud", None).isoformat()
            if getattr(solicitud, "fecha_solicitud", None) is not None
            else None,
        }

        try:
            resp = requests.post(N8N_URL_ASIGNAR_TURNO, json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            return Response(
                {
                    "detail": "Error al comunicarse con n8n",
                    "error": str(e),
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response(data, status=status.HTTP_200_OK)

class CrearTurnoDesdeSolicitudView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):

        solicitud_id = request.data.get('solicitud_id')
        transportista_id = request.data.get('transportista_id')
        vehiculo_id = request.data.get('vehiculo_id') # <--- NUEVO: RECIBIMOS EL ID DEL VEHÍCULO
        nuevo_estado = request.data.get('nuevo_estado')
        comentario_ia = request.data.get('comentario_ia')

        if not solicitud_id or not nuevo_estado:
            return Response(
                {"detail": "solicitud_id y nuevo_estado son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_estado not in ['asignado', 'rechazado']:
            return Response(
                {"detail": "nuevo_estado debe ser 'asignado' o 'rechazado'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not transportista_id:
            return Response(
                {"detail": "transportista_id es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud = get_object_or_404(SolicitudServicio, pk=solicitud_id)
        
        try:
            transportista_obj = Usuario.objects.get(pk=transportista_id)
        except Usuario.DoesNotExist:
             return Response({"detail": "Transportista no encontrado."}, status=status.HTTP_400_BAD_REQUEST)

        turno = DatasetTurnosIA.objects.filter(solicitud=solicitud).first()

        # --- LÓGICA DE SELECCIÓN DE VEHÍCULO CORREGIDA ---
        vehiculo = None
        
        # 1. Si nos envían un ID específico, lo buscamos directamente
        if vehiculo_id:
            vehiculo = get_object_or_404(Vehiculo, id=vehiculo_id)
            # Opcional: Validar que pertenezca al transportista
            if vehiculo.transportista_id != int(transportista_id):
                 return Response(
                    {"detail": "El vehículo seleccionado no pertenece al transportista."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 2. Si NO hay ID (fallback), buscamos el primero activo del transportista
        elif turno is None or turno.transportista_id != int(transportista_id):
            vehiculo = Vehiculo.objects.filter(
                transportista_id=transportista_id,
                estado='ACTIVO'
            ).order_by('id').first()

            if not vehiculo:
                return Response(
                    {"detail": "El transportista seleccionado no tiene vehículos activos."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Si ya existía un turno y es el mismo transportista, mantenemos el vehículo anterior
            vehiculo = turno.vehiculo
        # ---------------------------------------------------

        solicitud.estado = nuevo_estado
        solicitud.save()

        estado_map = {
            'ACTIVO': 'activo',
            'INACTIVO': 'inactivo',
            'MANTENIMIENTO': 'mantenimiento',
        }
        estado_vehiculo_dataset = estado_map.get(vehiculo.estado, 'activo')

        comentario_final = comentario_ia if nuevo_estado == 'asignado' else None

        if turno is None:
            fecha_turno = solicitud.fecha_solicitud or timezone.localdate()

            turno = DatasetTurnosIA.objects.create(
                transportista_id=transportista_id,
                vehiculo=vehiculo,
                solicitud=solicitud,
                fecha_turno=fecha_turno,
                estado_vehiculo=estado_vehiculo_dataset,
                vehiculo_operativo=(vehiculo.estado == 'ACTIVO'),
                estado_solicitud=solicitud.estado,
                comentario_ia=comentario_final,
            )
        else:
            turno.transportista_id = transportista_id
            turno.vehiculo = vehiculo
            turno.estado_vehiculo = estado_vehiculo_dataset
            turno.vehiculo_operativo = (vehiculo.estado == 'ACTIVO')
            turno.estado_solicitud = solicitud.estado

            if comentario_final is not None:
                turno.comentario_ia = comentario_final

            turno.save()

        print(f"     1. Nuevo Estado: '{nuevo_estado}' (Esperado: 'asignado')")
        print(f"     2. Tiene Teléfono?: {bool(transportista_obj.telefono)}")
            
        if nuevo_estado == 'asignado' and transportista_obj.telefono:
            
            payload_whatsapp = {
                "telefono": transportista_obj.telefono,
                "nombre_transportista": f"{transportista_obj.first_name} {transportista_obj.last_name}",
                "origen": solicitud.origen,
                "destino": solicitud.destino,
                "fecha_servicio": solicitud.fecha_solicitud.strftime('%Y-%m-%d')
            }

            try:
                requests.post(N8N_WEBHOOK_WHATSAPP, json=payload_whatsapp, timeout=3)
            except requests.exceptions.RequestException as e:
                print(f"ERROR: Fallo la conexión con el webhook de n8n: {e}")

        serializer = DatasetTurnosIASerializer(turno)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MisAsignacionesView(generics.ListAPIView):
    serializer_class = DatasetTurnosIASerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DatasetTurnosIA.objects.filter(
            transportista=self.request.user,
            solicitud__estado='asignado'  
        ).order_by('-fecha_turno')