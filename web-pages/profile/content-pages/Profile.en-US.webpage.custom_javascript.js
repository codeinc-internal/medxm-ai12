$(document).ready( async() => {
    let siteUrl= "https://medxmai.sharepoint.com"
    let thelist
    let AssessorId;
    const UniqueId="{{user.id}}"
    var attachment;

  
        var _GetAssessorUrl = "https://prod-14.canadacentral.logic.azure.com:443/workflows/8819f48320be480a848a4cddc707915a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=q4ww3AwPaeL-WMi2e-TDs80E1ZFxZmCHWB9kDYx__wQ";
    await shell.ajaxSafePost({
        type: "POST",
        contentType:"application/json; charset=UTF-8", // Include charset in Content-Type
        url: _GetAssessorUrl,
        data: JSON.stringify({UniqueId}),
        processData: false,
        global: false,
    }).done(function (body, textStatus, jqXHR) {
        if (jqXHR.status === 200) {
            thelist = typeof body === 'string' ? JSON.parse(body) : body;
            AssessorId=Object.values(thelist)[0][0].ID || "";

        } else {
            // Handle non-200 status codes
            console.error("Request failed with status code: " + jqXHR.status);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle the failure of the HTTP request
        console.error("Request failed: " + errorThrown);
});
    const firstName = document.getElementById("firstname")
    firstName.onChange=(event)=>{
        event.preventDefault()
        firstName.value=event.target.value
    }

    const lastName = document.getElementById("lastname")
    lastName.onChange=(event)=>{
        event.preventDefault()
        lastName.value=event.target.value
    }
    const biography = document.getElementById("cr681_biography")
    biography.onchange=(event)=>{
        event.preventDefault()
        biography.value = event.target.value
    }

    const ExpertType = document.getElementById("cr681_experttype")
    document.getElementById("ContentContainer_MainContent_MainContent_ContentBottom_MarketingOptionsPanel").style.display = "none";

    const profileViewDiv = document.getElementById("ProfileFormView")

    const label = document.createElement("label")
    label.className = "container"
    label.innerText = "Image Uplaod"


    const input = document.createElement('input')
    input.className = "container"
    input.type = "file"
    input.id = "fileInput"
    input.accept = ".png"
    input.name = "attacthment"
    profileViewDiv.appendChild(label)
    profileViewDiv.appendChild(input)

    // onChange 
    const inputOnChnage = document.getElementById("fileInput")



    inputOnChnage.addEventListener("change", function async() {
     const selectedFile = fileInput.files[0];
        if (selectedFile) {
            // Check if the selected file is an image
            if (selectedFile.type.startsWith('image/png')) {
                // Create a FileReader to read the selected image
                const reader = new FileReader();

                reader.onload = function (event) {
                    // Display the selected image as a preview
                    attachment = {
                        fileName: input.name,
                        fileType: input.type,
                        fileContact: event.target.result
                    }
                };
                // Read the selected file as a data URL
                reader.readAsDataURL(selectedFile);
            } else {
                alert('Please select an image file.');
                inputOnChnage.value = ''; // Clear the file input
            }
        }
    });


    const addbuttoon = document.createElement("button")
    addbuttoon.id="UploadItem"
    addbuttoon.className="btn btn-primary"
   if(AssessorId){
    addbuttoon.innerText="Update sharepoint"
   }else{
    addbuttoon.innerText="Upload to sharepoint"
   }

    

    addbuttoon.onclick= async (event)=>{

        event.preventDefault()
        const value = Object.values(ExpertType.selectedOptions)[0].innerText
        console.log(attachment)
        let  dataFormat = {
               firstName:firstName.value,
               lastName:lastName.value,
               biography:biography.value,
               ExpertType:value,
               UniqueId,
               attachment
           }
           const DataJSONFormat = JSON.stringify(dataFormat)
           var _url = "https://prod-24.canadacentral.logic.azure.com:443/workflows/e9f3aa681f514becb5f0b2c2076dcbd7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fbJU0VR6s57143uG2aS1AN77_tWx9pQYgHID56gPbJo";
           await shell.ajaxSafePost({
               type: "POST",
               contentType:"application/json; charset=UTF-8", // Include charset in Content-Type
               url: _url,
               data: DataJSONFormat,
               processData: false,
               global: false,
           }).done( async function (body, textStatus, jqXHR) {
               if (jqXHR.status === 200) {
                   let thelist = typeof body === 'string' ? JSON.parse(body) : body;
               
             
                 window.location.href = "/Generate";

                   
                
                
               } else {
                   // Handle non-200 status codes
                   console.error("Request failed with status code: " + jqXHR.status);
               }
           }).fail(function (jqXHR, textStatus, errorThrown) {
               // Handle the failure of the HTTP request
               console.error("Request failed: " + errorThrown);
    });
    }
    profileViewDiv.appendChild(addbuttoon)
    



})


