from django.http import HttpResponse
from django.urls import path
from rest_framework import generics

from gatewayapp.models import Administrator, Operator, Gateway
from gatewayapp.serializers import AdminSerializer, OperatorSerializer, GatewaySerializer
from . import views

# all url APIS exposed
urlpatterns = [
    path('', views.index, name='index'),
    path('api/create-admin/', views.create_admin, name='create-admin'),
    path('api/create-operator/', views.create_operator, name='create-operator'),
    path('api/create-gateway/', views.create_or_update_gateway, name='create-gateway'),
    path('api/delete-gateway/', views.delete_gateway, name='delete-gateway'),
    path('api/user-login/', views.user_login, name='user-login'),
    path('api/gateway-lists/', views.get_gateway_lists, name='get-gateway-lists'),
    path('api/operator-lists/', views.get_operator_lists, name='get-operator-lists'),
]


def main(request):
    return HttpResponse("Hello")


class AdminView(generics.CreateAPIView):
    queryset = Administrator.objects.all()
    serializer_class = AdminSerializer


class OperatorView(generics.CreateAPIView):
    queryset = Operator.objects.all()
    serializer_class = OperatorSerializer


class GatewayView(generics.CreateAPIView):
    queryset = Gateway.objects.all()
    serializer_class = GatewaySerializer
