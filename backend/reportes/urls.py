from django.urls import path
from.import views as reportes
from . import views

urlpatterns = [
    path('api/reportes/usuarios/pdf/', views.reporte_usuarios_pdf, name='reporte_usuarios_pdf'),
    path('api/reportes/solicitudes/pdf/', views.reporte_solicitudes_pdf, name='reporte_solicitudes_pdf'),
    path('api/reportes/vehiculos/pdf/', views.reporte_vehiculos_pdf, name='reporte_vehiculos_pdf'),

    path('api/reportes/usuarios/preview/', views.reporte_usuarios_preview, name='reporte_usuarios_preview'),
    path('api/reportes/solicitudes/preview/', views.reporte_solicitudes_preview, name='reporte_solicitudes_preview'),
    path('api/reportes/vehiculos/preview/', views.reporte_vehiculos_preview, name='reporte_vehiculos_preview'),

    path('finanzas-pdf/', views.reporte_finanzas_pdf, name='finanzas_pdf'),
]