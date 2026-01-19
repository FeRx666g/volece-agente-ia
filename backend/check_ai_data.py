import os
import sys
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_transporte.settings')
django.setup()

from gestion_vehiculos.models import Vehiculo
from gestion_usuarios.models import Usuario

def check_data():
    print("--- Checking Transportistas and Vehicles ---")
    
    # 1. Get all users with role 'TRANSP'
    transportistas = Usuario.objects.filter(rol__codigo='TRANSP')
    print(f"Total Transportistas (Role 'TRANSP'): {transportistas.count()}")
    
    for t in transportistas:
        print(f"\nTransportista: {t.username} (Active: {t.is_active})")
        # 2. Get vehicles for this transportista
        # Note: Relation is likely 'vehiculo_set' or similar. Let's query Vehiculo directly.
        vehs = Vehiculo.objects.filter(transportista=t)
        
        if vehs.exists():
            for v in vehs:
                estado_code = v.estado.codigo if v.estado else "NO_STATE"
                tipo_nombre = v.tipo_vehiculo.nombre if v.tipo_vehiculo else "NO_TYPE"
                print(f"  - Vehiculo ID: {v.id}, Placa: {v.placa}, Tipo: {tipo_nombre}, Estado: {estado_code}")
                
                # Check criteria
                if estado_code == 'ACTIVO' and t.is_active:
                    print("    -> MEETS CRITERIA: YES")
                else:
                    print(f"    -> MEETS CRITERIA: NO (Estado={estado_code}, UserActive={t.is_active})")
        else:
            print("  - No vehicles assigned.")

if __name__ == '__main__':
    with open('check_results.txt', 'w') as f:
        sys.stdout = f
        check_data()
