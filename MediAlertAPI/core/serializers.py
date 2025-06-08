from rest_framework import serializers
from .models import Medicamento
from .models import Alerta

class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '__all__'

class AlertaSerializer(serializers.ModelSerializer):
    medicamento = serializers.StringRelatedField()

    class Meta:
        model = Alerta
        fields = '__all__'
