from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicamentoViewSet, AlertaViewSet, marcar_alerta_como_tomada,
    CustomAuthToken, descargar_medicamentos_pdf,
    cambiar_contrasena, activar_suscripcion, verificar_suscripcion,
    perfil_usuario
)
from core.views import regenerar_alertas



router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet)
router.register(r'alertas', AlertaViewSet)

urlpatterns = [
    path('medicamentos/pdf/', descargar_medicamentos_pdf, name='medicamentos_pdf'),
    path('', include(router.urls)),
    path('alertas/<int:alerta_id>/marcar/', marcar_alerta_como_tomada, name='marcar_alerta'),
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('cambiar-contrasena/', cambiar_contrasena, name='cambiar_contrasena'),
    path("activar-suscripcion/", activar_suscripcion, name="activar_suscripcion"),
    path("verificar-suscripcion/", verificar_suscripcion, name="verificar_suscripcion"),
    path("perfil/", perfil_usuario, name="perfil_usuario"),
    path("api/regenerar-alertas/", regenerar_alertas),


]
