$("#btn-add").click(function() {
	
	$( 'form').parsley( 'validate' );	
	if(!$('form').parsley('isValid')){
		noty({
				text : 'Input validation failed!',
				'layout' : 'center',
				'type' : 'error'
		});		
		return;
	}
	

	var name = $('#inputName').val();
	var type = $('#inputType').val();
	var users = $('#inputUsers').val();
	var tenantId = $('#tenantId').val();

	var usersArray = []
	if (users != null) {
		usersArray = users.toString().split(",");
	}
	// alert(JSON.stringify(userGroupsArray));
	jso = {
		"tenant_id" : tenantId,
		"name" : name	
	};

	var previousName = getURLParameter('group');
	

	jQuery.ajax({
		url : getServiceURLs("groupsCRUD", previousName),
		type : "PUT",		
		data : JSON.stringify(jso),
		contentType : "application/json",
     	dataType : "json",
     	statusCode: {
			400: function() {
				noty({
					text : 'Error occured!',
					'layout' : 'center',
					'type': 'error'
				});
			},
			404: function() {
				noty({
					text : 'API not found!',
					'layout' : 'center',
					'type': 'error'
				});
			},
			500: function() {
				noty({
					text : 'Fatal error occured!',
					'layout' : 'center',
					'type': 'error'
				});
			},
			200: function() {
				noty({
					text : 'Role edited successfully!',
					'layout' : 'center'
				});
				window.location.assign("configuration");
			},
            403: function() {
				noty({
					text : 'Role already exist!',
					'layout' : 'center',
					'type': 'error'
				});				
			},
			409: function() {
				noty({
					text : 'Role already exist!',
					'layout' : 'center',
					'type': 'error'
				});				
			}
		}			
	});
	
	
	

});

