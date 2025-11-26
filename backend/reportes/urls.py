from django.urls import path
from.import views as reportes

urlpatterns = [
    path('api/reportes/usuarios/pdf/', reportes.reporte_usuarios_pdf, name='reporte_usuarios_pdf'),
    path('api/reportes/solicitudes/pdf/', reportes.reporte_solicitudes_pdf, name='reporte_solicitudes_pdf'),
    path('api/reportes/vehiculos/pdf/', reportes.reporte_vehiculos_pdf, name='reporte_vehiculos_pdf'),

    path('api/reportes/usuarios/preview/', reportes.reporte_usuarios_preview, name='reporte_usuarios_preview'),
    path('api/reportes/solicitudes/preview/', reportes.reporte_solicitudes_preview, name='reporte_solicitudes_preview'),
    path('api/reportes/vehiculos/preview/', reportes.reporte_vehiculos_preview, name='reporte_vehiculos_preview'),
]
