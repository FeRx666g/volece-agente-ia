from django.db import models
from django.conf import settings 

class Finanza(models.Model):
    TIPO_CHOICES = [
        ('INGRESO', 'Ingreso'),
        ('GASTO', 'Gasto'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name="Registrado por",
        related_name="movimientos_financieros"
    )

    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    
    monto = models.DecimalField(max_digits=12, decimal_places=2) 
    
    fecha = models.DateField(verbose_name="Fecha del movimiento")
    
    descripcion = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name="Descripción o Nota"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha', '-created_at']
        verbose_name = "Movimiento Financiero"
        verbose_name_plural = "Movimientos Financieros"

    def __str__(self):
        return f"{self.get_tipo_display()} - ${self.monto} ({self.fecha})"
