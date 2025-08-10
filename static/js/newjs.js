$(document).ready(function () {
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imageUpload").change(function () {
        $('.image-section').show();
        $('#btn-predict').show();
        $('#result').text('');
        $('#result').hide();
        $('#solution-container').hide();  // Hide solution section if any
        readURL(this);
    });

    // Predict
    $('#btn-predict').click(function () {
        var form_data = new FormData($('#upload-file')[0]);

        // Show loading animation
        $(this).hide();
        $('.loader').show();

        // Make prediction by calling api /predict
        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Get and display the result
                $('.loader').hide();
                $('#result').fadeIn(600);

                let message = '';
                let solutionMessage = '';
                switch(data.prediction) {
                    case 'Healthy':
                        message = 'Your plant looks healthy!<br>Keep up the good care!';
                        solutionMessage = 'Keep doing the following:<br>1. Water the plant regularly.<br>2. Provide sufficient sunlight.<br>3. Ensure proper drainage.<br>4. Check for pests periodically.';
                        break;
                    case 'Powdery':
                        message = 'Your plant has Powdery mildew.<br>It may be due to Erysiphe, Sphaerotheca, and Podosphaera fungus.<br>';
                        solutionMessage = 'The best Solution would be :<br>1.Use Sulfur: It disrupts fungal growth and is most effective when applied before the fungus is visible.<br>2.  Use Potassium Bicarbonate: A contact fungicide that works by creating an alkaline environment that is inhospitable to the fungus.<br>3. Apply Neem Oil: An organic option that works by disrupting the funguss life cycle and preventing spore germination.<br>4. Check for pests periodically.';
                        break;
                    case 'Rust':
                        message = 'Your plant has Rust.<br> It may be due to Puccinia,Hemileia vastatrix fungus.<br>It may be from the Fungal spores of other plants ';
                        solutionMessage = 'Here are some solutions for Rust:<br>1. Remove affected leaves and destroy them.<br>2. Use Chlorothalonil: Acts as a preventative treatment for rust.<br>3.Use Mancozeb: Functions as a protectant fungicide.<br>4.Apply Trifloxystrobin: Inhibits fungal respiration and growth<br>.5.Ensure proper watering to avoid overwatering';
                        break;
                    default:
                        message = 'The prediction could not be determined.';
                }

                $('#result').html('Result: ' + data.prediction + '<br>' + message);

                // Create and append the Solution button if there's a solution message
                if (solutionMessage) {
                    let solutionButton = $('<button>', {
                        text: 'Solution',
                        id: 'btn-solution',
                        class: 'btn btn-warning btn-lg'
                    });
                    $('#result').append('<br>').append(solutionButton);

                    // Event listener for Solution button
                    solutionButton.click(function () {
                        if ($('#solution-container').length == 0) {
                            $('<div>', {
                                id: 'solution-container',
                                html: solutionMessage,
                                class: 'alert alert-info'
                            }).insertAfter('#result');
                        } else {
                            $('#solution-container').html(solutionMessage).show();
                        }
                    });
                }

                console.log('Success:', data);
            },
            error: function (error) {
                $('.loader').hide();
                $('#result').fadeIn(600);
                $('#result').text('Error: ' + error.responseJSON.error);
                console.log('Error:', error);
            }
        });
    });
});
