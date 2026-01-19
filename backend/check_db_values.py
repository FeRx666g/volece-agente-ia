import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_transporte.settings')
django.setup()

from gestion_transporte.models import DatasetTurnosIA

def check_db_values():
    print("--- Inspecting DatasetTurnosIA ---")
    turnos = DatasetTurnosIA.objects.all()
    if not turnos.exists():
        print("No records found in DatasetTurnosIA.")
    
    for t in turnos:
        print(f"ID: {t.id} | Transp: {t.transportista.username} | Fecha: {t.fecha_turno} | Estado: '{t.estado_solicitud}'")

if __name__ == '__main__':
    with open('check_db_values.txt', 'w') as f:
        sys.stdout = f
        check_db_values()
