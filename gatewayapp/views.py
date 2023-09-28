import json

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view

from gatewayapp.models import Gateway, Administrator, Operator
from gatewayapp.serializers import OperatorSerializer, AdminSerializer, GatewaySerializer


# Create Administrator account
@api_view(['POST'])
def create_admin(request):
    try:
        username = get_username(request)
        if not username:
            return JsonResponse({'error': 'Username cannot be empty'}, status=400)

        admins = Administrator.objects.filter(username=username)
        if len(admins) > 0:
            return JsonResponse({'error': 'Same Admin', "message": f"'{username}' already exist."},
                                status=400)
        admin_data = {
            'username': username,
        }
        serializer = AdminSerializer(data=admin_data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'message': 'Admin created successfully',
                                 'data': dict(serializer.data)}, status=200)
        else:
            # return JsonResponse(serializer.errors, status=400)
            return JsonResponse({'message': 'Invalid username'}, status=400)
        # Return a JSON response
    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Create Operator account
@api_view(['POST'])
def create_operator(request):
    try:
        # Parse the JSON data from the request body
        data_str = request.body.decode('utf-8')

        # Parse the JSON data
        data = json.loads(data_str)
        username = data.get('username')
        admin_username = data.get('admin_username')
        if not username:
            return JsonResponse({'error': 'Username cannot be empty'}, status=400)

        admin = Administrator.objects.filter(username=admin_username)
        if not admin:
            return JsonResponse({'error': 'No Admin exists', "message": f"{admin_username} not exist."},
                                status=400)
        operators = Operator.objects.filter(username=username, admin=admin.first())

        if len(operators) > 0:
            return JsonResponse({'error': 'Same Operator', "message": f"'{username}' already exist."},
                                status=400)
        # Create a new operator
        try:
            operator_data = {
                'username': username,
                'admin': admin.first().pk  # Assuming admin is a ForeignKey field
            }
            serializer = OperatorSerializer(data=operator_data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({'message': 'Operator created successfully', 'data': dict(serializer.data)},
                                    status=200)
            else:
                return JsonResponse({'message': 'Invalid username'}, status=400)
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'Invalid Operator', "message": f"'{username}' does not exist."},
                                status=400)

        # Return a JSON response
    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Create OR Update Gateway
@api_view(['POST', 'PUT', 'PATCH'])
def create_or_update_gateway(request):
    try:
        # Parse the JSON data from the request body
        data_str = request.body.decode('utf-8')

        # Parse the JSON data
        data = json.loads(data_str)
        antenna = data.get('antenna_diameter')
        loc = data.get('location_name')
        lat = data.get('latitude')
        long = data.get('longitude')
        admin_id = data.get('admin_id')
        isUpdate = data.get('create_update')  # 0= create, 1 = update

        if not antenna or not loc or not lat or not long or not admin_id:
            return JsonResponse({'error': 'Fields cannot be empty', "message": "Fields cannot be empty"}, status=400)
        try:
            if isUpdate:
                gateway = Gateway.objects.filter(location_name=loc).first()
                if not gateway:
                    return JsonResponse({'error': 'Invalid Gateway', "message": "Location name already exist."},
                                        status=400)
                else:
                    new_gateway = {
                        'antenna_diameter': antenna,
                        'longitude': long,
                        'latitude': lat,
                        'location_name': loc,
                        'admin': gateway.admin.pk  # Assuming admin is a ForeignKey field
                    }
                    serializer = GatewaySerializer(gateway, data=new_gateway,
                                                   partial=True if request.method == 'PATCH' else False)
                    if serializer.is_valid():
                        serializer.save()
                        return JsonResponse({'message': 'Gateway updated successfully'}, status=200)
                    else:
                        raise ObjectDoesNotExist
            else:
                administrator = Administrator.objects.filter(id=admin_id).first()
                if not administrator:
                    raise ObjectDoesNotExist
                gateway_data = {
                    'antenna_diameter': antenna,
                    'longitude': long,
                    'latitude': lat,
                    'location_name': loc,
                    'admin': administrator.pk  # Assuming admin is a ForeignKey field
                }
                serializer = GatewaySerializer(data=gateway_data)
                if serializer.is_valid():
                    serializer.save()
                    return JsonResponse({'message': 'Gateway created successfully'}, status=200)
                else:
                    # serializer.errors
                    return JsonResponse({'message': 'Invalid data'}, status=400)
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'Invalid Administrator', "message": "Admin does not exist."},
                                status=400)

    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Delete Gateway
@api_view(['DELETE'])
def delete_gateway(request):
    try:
        # Parse the JSON data from the request body
        loc = request.query_params['location_name']

        if not loc:
            return JsonResponse({'error': 'Fields cannot be empty'}, status=400)

        # Create a new admin
        try:
            gateway = Gateway.objects.filter(location_name=loc).first()
            if gateway is None:
                raise ObjectDoesNotExist
            gateway.delete()
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'Invalid Gateway', "message": "Gateway does not exist."},
                                status=400)

        # Return a JSON response
        return JsonResponse({'message': 'Gateway deleted successfully'}, status=200)
    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Login either Administrator or Operator
@api_view(['POST'])
def user_login(request):
    try:
        # Parse the JSON data from the request body
        data_str = request.body.decode('utf-8')

        # Parse the JSON data
        data = json.loads(data_str)
        username = data.get('username')
        user_type = data.get('user_type') # to check if login is either from operator or admin

        if not username or not user_type:
            return JsonResponse({'error': 'Fields cannot be empty'}, status=400)

        if user_type == "1":
            admin = Administrator.objects.filter(username=username).first()
            if admin:
                return JsonResponse({'username': admin.username, "user_type": '1', "id": admin.id},
                                    status=200)
        else:
            operator = Operator.objects.filter(username=username).first()
            if operator:
                return JsonResponse({'username': operator.username, "user_type": '1', "id": operator.id,
                                     "admin_id": operator.admin_id},
                                    status=200)
        return JsonResponse({'error': 'No user', "message": "No User found"}, status=400)

    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Get lists of Gateways
@api_view(['GET'])
def get_gateway_lists(request):
    try:
        admin_id = request.query_params['admin_id']
        gateway_list = Gateway.objects.filter(admin_id=admin_id).values()
        return JsonResponse(list(gateway_list), safe=False, status=200)

    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Get lists of Operators
@api_view(['GET'])
def get_operator_lists(request):
    try:
        admin_id = request.query_params['admin_id']
        op_list = Operator.objects.filter(admin_id=admin_id).values()
        return JsonResponse(list(op_list), safe=False, status=200)

    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON data', "message": e.msg}, status=400)


# Get username for more usability
def get_username(request):
    data_str = request.body.decode('utf-8')

    # Parse the JSON data
    data = json.loads(data_str)
    param = data.get('username')

    return param

# Rendering index.html
def index(request):
    return render(request, 'index.html')
