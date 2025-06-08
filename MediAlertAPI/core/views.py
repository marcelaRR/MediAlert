from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
import requests
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from .models import Medicamento, Alerta
from .serializers import MedicamentoSerializer, AlertaSerializer
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta, time, date

User = get_user_model()

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        user = token.user
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        })

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer

    def perform_create(self, serializer):
        medicamento = serializer.save()
        generar_alertas_para_medicamento(medicamento)


class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alerta.objects.all().order_by('fecha', 'hora')
    serializer_class = AlertaSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def perfil_usuario(request):
    usuario = request.user
    return Response({
        "nombre": usuario.username,
        "email": usuario.email,
        "suscrito": usuario.perfil.suscrito
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verificar_suscripcion(request):
    return Response({ "suscrito": request.user.perfil.suscrito })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def activar_suscripcion(request):
    perfil = request.user.perfil
    perfil.suscrito = True
    perfil.save()
    return Response({"mensaje": "Suscripción activada"})


@api_view(["POST"])
def marcar_alerta_como_tomada(request, alerta_id):
    try:
        alerta = Alerta.objects.get(id=alerta_id)
        alerta.tomada = True
        alerta.save()
        return Response({'message': 'Alerta marcada como tomada'})
    except Alerta.DoesNotExist:
        return Response({'error': 'Alerta no encontrada'}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cambiar_contrasena(request):
    user = request.user
    actual = request.data.get("actual")
    nueva = request.data.get("nueva")

    if not user.check_password(actual):
        return Response({"error": "Contraseña actual incorrecta"}, status=400)

    user.set_password(nueva)
    user.save()
    return Response({"mensaje": "Contraseña cambiada correctamente"})

@api_view(["GET"])
def descargar_medicamentos_pdf(request):
    buffer = HttpResponse(content_type='application/pdf')
    buffer['Content-Disposition'] = 'attachment; filename="medicamentos.pdf"'

    p = canvas.Canvas(buffer)
    p.setFont("Helvetica", 12)
    p.drawString(100, 800, "MediAlert - Lista de Medicamentos")

    medicamentos = Medicamento.objects.all()
    y = 770
    for med in medicamentos:
        p.drawString(100, y, f"- {med.nombre} | Cada {med.frecuencia_horas}h | Inicio: {med.hora_inicio}")
        y -= 20

    p.showPage()
    p.save()
    return buffer


def generar_alertas_para_medicamento(medicamento):
    from datetime import datetime, timedelta, date

    inicio = datetime.combine(date.today(), medicamento.hora_inicio)
    frecuencia = timedelta(hours=medicamento.frecuencia_horas)
    ahora = inicio
    fin = datetime.now() + timedelta(hours=24)

    while ahora <= fin:
        Alerta.objects.create(
            medicamento=medicamento,
            fecha=ahora.date(),
            hora=ahora.time(),
        )
        ahora += frecuencia



@api_view(["POST"])
def regenerar_alertas(request):
    from .models import Medicamento
    Medicamento.objects.all().delete()  # Opcional: si quieres limpiar y probar desde 0
    for medicamento in Medicamento.objects.all():
        generar_alertas_para_medicamento(medicamento)
    return Response({"mensaje": "Alertas regeneradas"})


@api_view(["POST"])
def regenerar_alertas(request):
    from .models import Medicamento, Alerta
    Alerta.objects.all().delete()  # limpia alertas anteriores
    for medicamento in Medicamento.objects.all():
        generar_alertas_para_medicamento(medicamento)
    return Response({"mensaje": "Alertas regeneradas"})
