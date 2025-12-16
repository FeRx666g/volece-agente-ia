from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinanzaViewSet, BalanceView

router = DefaultRouter()
router.register(r'movimientos', FinanzaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('balance/', BalanceView.as_view(), name='balance-financiero'),
]