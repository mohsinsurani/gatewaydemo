from rest_framework import serializers
from gatewayapp.models import Administrator, Operator, Gateway


# Serializers to serialize and de-serialize the data to and from the database
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrator
        fields = '__all__'


class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = '__all__'


class GatewaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gateway
        fields = '__all__'
