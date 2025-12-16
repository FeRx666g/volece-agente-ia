from datetime import datetime

from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from django.template.loader import get_template
from django.utils.timezone import now
from xhtml2pdf import pisa
from django.db.models import Sum
from gestion_finanzas.models import Finanza

from gestion_transporte.models import Usuario, SolicitudServicio, Vehiculo


# =========================================================
# PREVIEWS (JSON)
# =========================================================

# ---------- PREVIEW USUARIOS ----------
def reporte_usuarios_preview(request):
    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    qs = Usuario.objects.all()

    if search:
        qs = qs.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(cedula_ruc__icontains=search) |
            Q(email__icontains=search) |
            Q(username__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__lte=fecha_h)
        except ValueError:
            pass

    total = qs.count()
    data = [
        {
            "nombre": f"{u.first_name} {u.last_name}",
            "cedula": u.cedula_ruc,
            "email": u.email,
        }
        for u in qs[:50]
    ]

    return JsonResponse({"total": total, "data": data})


# ---------- PREVIEW SOLICITUDES ----------
def reporte_solicitudes_preview(request):
    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = SolicitudServicio.objects.select_related('cliente').all()

    if search:
        qs = qs.filter(
            Q(cliente__first_name__icontains=search) |
            Q(cliente__last_name__icontains=search) |
            Q(cliente__cedula_ruc__icontains=search) |
            Q(origen__icontains=search) |
            Q(destino__icontains=search) |
            Q(tipo_carga__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    total = qs.count()
    data = [
        {
            "cliente": f"{s.cliente.first_name} {s.cliente.last_name}",
            "origen": s.origen,
            "destino": s.destino,
            "estado": s.estado,
        }
        for s in qs[:50]
    ]

    return JsonResponse({"total": total, "data": data})


# ---------- PREVIEW VEHÍCULOS ----------
def reporte_vehiculos_preview(request):
    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = Vehiculo.objects.select_related('transportista').all()

    if search:
        qs = qs.filter(
            Q(placa__icontains=search) |
            Q(marca__icontains=search) |
            Q(modelo__icontains=search) |
            Q(transportista__first_name__icontains=search) |
            Q(transportista__last_name__icontains=search) |
            Q(transportista__cedula_ruc__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    total = qs.count()
    data = [
        {
            "placa": v.placa,
            "vehiculo": f"{v.marca} {v.modelo}",
            "transportista": f"{v.transportista.first_name} {v.transportista.last_name}",
            "estado": v.estado,
        }
        for v in qs[:50]
    ]

    return JsonResponse({"total": total, "data": data})


# =========================================================
# REPORTES PDF
# =========================================================

# ---------- PDF USUARIOS ----------
def reporte_usuarios_pdf(request):
    template = get_template('reportes/usuarios_pdf.html')

    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    qs = Usuario.objects.all()

    if search:
        qs = qs.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(cedula_ruc__icontains=search) |
            Q(email__icontains=search) |
            Q(username__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__lte=fecha_h)
        except ValueError:
            pass

    html = template.render({
        'usuarios': qs,
        'fecha': now().strftime('%d/%m/%Y'),
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_usuarios.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response


# ---------- PDF SOLICITUDES ----------
def reporte_solicitudes_pdf(request):
    template = get_template('reportes/solicitudes_pdf.html')

    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = SolicitudServicio.objects.select_related('cliente').all()

    if search:
        qs = qs.filter(
            Q(cliente__first_name__icontains=search) |
            Q(cliente__last_name__icontains=search) |
            Q(cliente__cedula_ruc__icontains=search) |
            Q(origen__icontains=search) |
            Q(destino__icontains=search) |
            Q(tipo_carga__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    html = template.render({
        'solicitudes': qs,
        'fecha': now().strftime('%d/%m/%Y'),
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_solicitudes.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response


# ---------- PDF VEHÍCULOS ----------
def reporte_vehiculos_pdf(request):
    template = get_template('reportes/vehiculos_pdf.html')

    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = Vehiculo.objects.select_related('transportista').all()

    if search:
        qs = qs.filter(
            Q(placa__icontains=search) |
            Q(marca__icontains=search) |
            Q(modelo__icontains=search) |
            Q(transportista__first_name__icontains=search) |
            Q(transportista__last_name__icontains=search) |
            Q(transportista__cedula_ruc__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    html = template.render({
        'vehiculos': qs,
        'fecha': now().strftime('%d/%m/%Y'),
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_vehiculos.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response

# =========================================================
# REPORTE PDF FINANZAS
# =========================================================
def reporte_finanzas_pdf(request):
    template = get_template('reportes/finanzas_pdf.html')

    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    tipo = request.GET.get('tipo')

    qs = Finanza.objects.all().order_by('-fecha')

    if fecha_inicio:
        try:
            fecha_d = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            qs = qs.filter(fecha__gte=fecha_d)
        except ValueError:
            pass

    if fecha_fin:
        try:
            fecha_h = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            qs = qs.filter(fecha__lte=fecha_h)
        except ValueError:
            pass

    if tipo:
        qs = qs.filter(tipo=tipo)

    total_ingresos = qs.filter(tipo='INGRESO').aggregate(Sum('monto'))['monto__sum'] or 0
    total_gastos = qs.filter(tipo='GASTO').aggregate(Sum('monto'))['monto__sum'] or 0
    balance = total_ingresos - total_gastos

    html = template.render({
        'movimientos': qs,
        'ingresos': total_ingresos,
        'gastos': total_gastos,
        'balance': balance,
        'fecha': now().strftime('%d/%m/%Y'),
        'filtros': {'desde': fecha_inicio, 'hasta': fecha_fin}
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_finanzas.pdf"'
    
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response