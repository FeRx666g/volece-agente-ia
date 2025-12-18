from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication 
from django.db.models import Sum
from .models import Finanza
from .serializers import FinanzaSerializer

class FinanzaViewSet(viewsets.ModelViewSet):
    queryset = Finanza.objects.all()
    serializer_class = FinanzaSerializer
    
    authentication_classes = [JWTAuthentication] 
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser] 

    def get_queryset(self):
        
        queryset = super().get_queryset()
        
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        tipo = self.request.query_params.get('tipo')

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__range=[fecha_inicio, fecha_fin])
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class BalanceView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        queryset = Finanza.objects.all()
        
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__range=[fecha_inicio, fecha_fin])

        total_ingresos = queryset.filter(tipo='INGRESO').aggregate(Sum('monto'))['monto__sum'] or 0
        total_gastos = queryset.filter(tipo='GASTO').aggregate(Sum('monto'))['monto__sum'] or 0

        balance = total_ingresos - total_gastos

        return Response({
            "ingresos": total_ingresos,
            "gastos": total_gastos,
            "balance": balance
        })