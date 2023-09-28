import pytest

import os
from django.conf import settings
from django.db import IntegrityError

databases = '__all__'

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gatewayex.settings")
if not settings:
    settings.configure()
import django

django.setup()
from gatewayapp.models import Administrator, Operator, Gateway
from gatewayapp.serializers import OperatorSerializer, GatewaySerializer, AdminSerializer


# Test case for creating a Models
def test_create_models():
    admin = Administrator(username="john_doe")
    assert admin is not None
    assert admin.username == "john_doe"

    op = Operator(username="s", admin=admin)
    assert op is not None

    gat = Gateway(antenna_diameter=2, latitude=2, longitude=3, location_name="df")
    assert gat is not None


# Test case for entering invalid input and check if that data exist in db
def test_gateway_models():
    # Test with Invalid input of antenna_diameter
    try:
        gat = Gateway(antenna_diameter="sdsdsd", latitude="2", longitude=3, location_name="dsf")
        gat.save()
        # Data save should fail
    except IntegrityError as e:
        saved_gat_delete_check = Gateway.objects.filter(location_name="dsf")
        assert len(saved_gat_delete_check) == 0
    except Exception as e:
        saved_gat_delete_check = Gateway.objects.filter(location_name="dsf")
        assert len(saved_gat_delete_check) == 0


# Test case for saving the data
def test_save_data():
    # Test with valid input
    try:
        # Saving the data
        admin_username = "eabc"
        admin = Administrator(username=admin_username)
        admin.save()
        assert admin is not None

        # Operator should get saved with provided administrator foreign key
        op = Operator(username="s", admin=admin)
        op.save()
        assert op is not None

        # Gateway should get saved with provided administrator foreign key
        gat = Gateway(antenna_diameter=22, latitude=2, longitude=3, location_name="df", admin=admin)
        gat.save()
        assert gat is not None

        # fetching the data and its values and comparing
        saved_gat = Gateway.objects.get(pk=gat.pk)
        assert saved_gat.antenna_diameter == 22

        saved_op = Operator.objects.get(pk=op.pk)
        assert saved_op.username == "s"

        saved_admin = Administrator.objects.get(pk=admin.pk)
        assert saved_admin.username == admin_username

        # Checking the data if it gets deleted, It shouldn't get saved in db
        saved_gat.delete()
        saved_gat_delete_check = Gateway.objects.filter(pk=saved_gat.pk)
        assert len(saved_gat_delete_check) == 0

        # Checking the gateway is deleted then operator shouldn't get deleted
        op_check = Operator.objects.filter(pk=op.pk)
        assert len(op_check) > 0

        # Checking the gateway is deleted then Administrator shouldn't get deleted
        admin_check = Administrator.objects.filter(pk=saved_admin.pk)
        assert len(admin_check) > 0

        # Checking the operator data if it gets deleted, it shouldn't stay in db
        saved_op.delete()
        saved_op_delete_check = Operator.objects.filter(pk=saved_op.pk)
        assert len(saved_op_delete_check) == 0

        # Checking the admin data if it gets deleted, it shouldn't stay in db
        saved_admin.delete()
        saved_admin_delete_check = Administrator.objects.filter(pk=saved_admin.pk)
        assert len(saved_admin_delete_check) == 0
    except IntegrityError as e:
        raise AssertionError("Exception should not occur {}".format(e.args[0]))
    except Exception as e:
        raise AssertionError("Exception should not occur {}".format(e.args[0]))


# test permissions for gateway
def test_permission_gateway_creation():
    try:
        admin_username = "bbc"
        loc_name = "london"
        admin = Administrator(username=admin_username)
        admin.save()
        op = Operator(username="op", admin=admin)
        op.save()

        gat = Gateway(antenna_diameter=22, latitude=22, longitude=3, location_name=loc_name, admin=op)
        gat.save()
        # Data save should fail because It cannot be saved with operator

    except Exception as e:
        # Gateway should not be created by operator
        print(e.args[0])
        assert len(e.args) > 0


# test permissions for operator
def test_permission_operator_creation():
    try:
        admin_username = "cbc"
        admin = Administrator(username=admin_username)
        admin.save()
        op = Operator(username="op")
        op.save()
        # Data save should fail because It cannot be saved without administrator

    except Exception as e:
        # Operator cannot exists by itself
        print(e.args[0])
        assert len(e.args) > 0


# test permissions for administrator
def test_permission_administrator_creation():
    try:
        admin = Administrator(username=None)
        admin.save()
        # Data save should fail because It cannot be saved without username
    except IntegrityError as e:
        print(e.args[0])
        assert len(e.args) > 0
    except Exception as e:
        # Administrator should not get created without username as it is the method of login
        print(e.args[0])
        assert len(e.args) > 0


# test permissions for administrator serialization
def test_administrator_serializer():
    username = "my_new_usenrame"
    data = {'username': username}
    serializer = AdminSerializer(data=data)
    assert serializer.is_valid()
    assert serializer.validated_data['username'] == username


# test permissions for operator serialization
def test_operator_serializer():
    admin_username = "cbcv"
    admin = Administrator(id=1020, username=admin_username)
    admin.save()
    data = {'username': 'operator1', 'admin': admin.pk}
    serializer = OperatorSerializer(data=data)
    assert serializer.is_valid()
    assert serializer.validated_data['username'] == 'operator1'
    assert serializer.validated_data['admin'] == admin


# test permissions for gateway serialization
def test_gateway_serializer():
    admin_username = "rbcv"
    loc_name = "new location"
    admin = Administrator(id=1030, username=admin_username)
    admin.save()
    data = {'antenna_diameter': 2.5, 'latitude': 2.0, 'longitude': 3.0, 'location_name': loc_name, 'admin': admin.pk}
    serializer = GatewaySerializer(data=data)
    assert serializer.is_valid()
    assert serializer.validated_data['antenna_diameter'] == 2.5
    assert serializer.validated_data['latitude'] == 2.0
    assert serializer.validated_data['longitude'] == 3.0
    assert serializer.validated_data['location_name'] == loc_name
    assert serializer.validated_data['admin'] == admin


# Run the tests using pytest
if __name__ == "__main__":
    pytest.main()
