from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class Usuario(AbstractUser):
    """
    Modelo personalizado de usuario.
    """
    pass


class Perfil(models.Model):
    """
    Perfil del usuario para indicar si está suscrito o no.
    """
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    suscrito = models.BooleanField(default=False)

    def __str__(self):
        return self.usuario.username


class Medicamento(models.Model):
    nombre = models.CharField(max_length=100)
    frecuencia_horas = models.IntegerField()
    hora_inicio = models.TimeField()

    def __str__(self):
        return f"{self.nombre} (cada {self.frecuencia_horas}h desde {self.hora_inicio})"


class Alerta(models.Model):
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE, related_name="alertas")
    fecha = models.DateField()
    hora = models.TimeField()
    tomada = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.medicamento.nombre} - {self.hora} - {'Tomada' if self.tomada else 'Pendiente'}"
