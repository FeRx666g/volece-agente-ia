from django.urls import path
from . import views  

urlpatterns = [
    # Reportes Admin
    path('usuarios/pdf/', views.reporte_usuarios_pdf, name='reporte_usuarios_pdf'),
    path('solicitudes/pdf/', views.reporte_solicitudes_pdf, name='reporte_solicitudes_pdf'),
    path('vehiculos/pdf/', views.reporte_vehiculos_pdf, name='reporte_vehiculos_pdf'),

    # Previews Admin
    path('usuarios/preview/', views.reporte_usuarios_preview, name='reporte_usuarios_preview'),
    path('solicitudes/preview/', views.reporte_solicitudes_preview, name='reporte_solicitudes_preview'),
    path('vehiculos/preview/', views.reporte_vehiculos_preview, name='reporte_vehiculos_preview'),

    path('finanzas-pdf/', views.reporte_finanzas_pdf, name='finanzas_pdf'),

    path('mantenimientos-pdf/', views.reporte_mantenimientos_pdf, name='reporte_mantenimientos_pdf'),
]