$(document).ready(async() => {
    const wholeDataArrayString = sessionStorage.getItem("wholeDataArray");
    if(wholeDataArrayString===""){
        window.location.href="/Generate"
    }
  let AssessorId;
  const UniqueId="{{user.id}}"

    // Get the assessor Id  with the help of unique Id 

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
           let thelist = typeof body === 'string' ? JSON.parse(body) : body;
            AssessorId=Object.values(thelist)[0][0].ID || "";

        } else {
            // Handle non-200 status codes
            console.error("Request failed with status code: " + jqXHR.status);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle the failure of the HTTP request
        console.error("Request failed: " + errorThrown);
});

   

    // Convert the JSON strings back to objects
    let sectionArray = []
    const wholeDataArrayFormart = JSON.parse(wholeDataArrayString);
    sectionArray = wholeDataArrayFormart[0].sections

    let concatenatedSectionResult = '';
    // Concat Section Result 

    sectionArray.map((data) => {
        const sectionName = Object.keys(data)[0]
        const sectionData = Object.values(data)[0].aiReport
        concatenatedSectionResult += sectionName + "\n";
        concatenatedSectionResult += sectionData + "\n\n";
    })
    console.log(concatenatedSectionResult);

    // Get references to the elements
    // section list

    const listGroup = document.querySelector(".Sections");
    const sectionDetails = document.querySelector(".Section-Details");
    // question list
    const listGroupQuestionAnswer = document.querySelector(".Question-Answer");
    const questionAnswerDetail = document.querySelector(".Question-Answer-Detail");
    const Showmodal=() =>{
        $('#loader-overlay').show();
        $('#loader').modal('show');
    }
  
    // Hide the loading modal
    const HideModal =()=> {
     $('#loader-overlay').hide();
        $('#loader').modal('hide');
    }

    // Generate dynamic section links and set their click event handlers
    sectionArray.map((data => {
        const sectionName = Object.keys(data)[0]
        const link = document.createElement("a");
        link.classList.add("list-group-item");
        link.setAttribute("data-section", sectionName);
        link.innerHTML = `<span class="xrm-attribute-value-encoded xrm-attribute-value">${sectionName}</span>`;
        listGroup.appendChild(link);

        // Add a click event listener to each link
        link.addEventListener("click", async () => {
            //clear previous data 
            questionAnswerDetail.innerHTML = ""
            sectionDetails.innerHTML = ""
            // Update the content in Section-Details
            const sectionData = Object.values(data)[0]
            const h2 = document.createElement('h2');
            h2.textContent = sectionName;

            // Create the <p> element
            const p = document.createElement('p');
            p.style.border = '1px solid gainsboro';
            p.style.padding = '5px';
            p.style.fontSize = '16px';
            p.textContent = sectionData.aiReport;

            // Create the <hr> element
            const hr = document.createElement('hr');

            // Create the <label> element
            const label = document.createElement('label');
            label.setAttribute('for', 'prompt');
            label.textContent = 'Write Your Prompt Here:';

            // Create the <textarea> element
            let prompt = ""
            const textarea = document.createElement('textarea');
            textarea.classList.add('form-control');
            textarea.id = 'prompt';
            textarea.rows = 3;
            textarea.onchange = (event) => {
                event.preventDefault()
                prompt += event.target.value
            }

            // Create the <div> element for buttons
            const buttonDiv = document.createElement('div');
            buttonDiv.style.textAlign = 'center';

            // Create the "Reset" button
            const resetButton = document.createElement('button');
            resetButton.style.padding="10px 40px"
            resetButton.style.margin = '9px 40px';
            resetButton.style.backgroundColor="rgba(58, 98, 175, 1)"
            resetButton.style.color="white";
            resetButton.style.borderRadius="10px"
            resetButton.style.borderStyle="none"

            resetButton.textContent = 'Reset';
            resetButton.onclick = () => {
                sectionData.aiReport = sectionData.previousData
                p.textContent = sectionData.previousData
            }

            // Create the "Ask AI" button
            const askAIButton = document.createElement('button');
            askAIButton.style.margin = '9px 40px';
            askAIButton.style.backgroundColor="rgba(58, 98, 175, 1)"
            askAIButton.style.padding="10px 40px";
            askAIButton.style.color="white";
            askAIButton.style.borderRadius="10px"
            askAIButton.style.borderStyle="none"


            askAIButton.textContent = 'Ask AI';
            askAIButton.onclick = async (event) => {
                Showmodal()
                event.preventDefault()
                const GeneratedReport = sectionData.aiReport
                const Prompt = prompt
                var RegeneratURL = "https://prod-08.canadacentral.logic.azure.com:443/workflows/a52aa83853ae48c486d6841511c51455/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=1P1vYO1Gn8YQuWtRPdJ7lOGDYnlHOoKOJBKhe4IGbD8";
                await shell.ajaxSafePost({
                    type: "POST",
                    contentType: "application/json; charset=UTF-8", // Include charset in Content-Type
                    url: RegeneratURL,
                    data: JSON.stringify({ GeneratedReport, Prompt }),
                    processData: false,
                    global: false,
                }).done(function (body, textStatus, jqXHR) {
                    if (jqXHR.status === 200) {
                        // Request was successful, process the response
                        const result = Object.values(body)[0]
                        sectionData.aiReport = result
                        p.textContent = result

                    } else {
                        // Handle non-200 status codes
                        console.error("Request failed with status code: " + jqXHR.status);
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    // Handle the failure of the HTTP request
                    console.error("Request failed: " + errorThrown);
                });
                HideModal()
            }


            // Append all elements to the buttonDiv
            buttonDiv.appendChild(resetButton);
            buttonDiv.appendChild(askAIButton);
            sectionDetails.appendChild(h2)
            sectionDetails.appendChild(p)
            sectionDetails.appendChild(hr)
            sectionDetails.appendChild(label)
            sectionDetails.appendChild(textarea)
            sectionDetails.appendChild(buttonDiv)




        });
        link.click()
    }))




    // // Generate dynamic question categories and link 
    for (const category in wholeDataArrayFormart[0].QuestionAnswer) {
        if (wholeDataArrayFormart[0].QuestionAnswer.hasOwnProperty(category)) {
            const linkCategory = document.createElement("a");
            linkCategory.classList.add("list-group-item");
            linkCategory.innerHTML = `<span class="xrm-attribute-value-encoded xrm-attribute-value">${category}</span>`;
            listGroupQuestionAnswer.appendChild(linkCategory);

            // Add click event listener to each category link
            linkCategory.addEventListener("click", () => {
                sectionDetails.innerHTML = ""
                // Clear previous content
                questionAnswerDetail.innerHTML = "";
                const SuperHeading = document.createElement("h1")
                SuperHeading.innerText = category
                questionAnswerDetail.appendChild(SuperHeading)
                const categories = Object.values(wholeDataArrayFormart[0].QuestionAnswer[category]);
                categories.forEach((data) => {
                    // subheading 
                    const subCategory = Object.keys(data)[0]
                    const subheading = document.createElement("div")
                    subheading.style = "text-align: center; background-color: lightgray;"
                    subheading.innerHTML = ` <h1>${subCategory}</h1>`
                    questionAnswerDetail.appendChild(subheading)

                    const qaSet = Object.values(data)[0];


                    // container for the question and answer
                    qaSet.forEach((data, index) => {
                        const QuestionData = Object.values(data)[0]
                        const questionDiv = document.createElement("div");
                        const h2 = document.createElement('h2');
                        h2.textContent = `Question ${index + 1}`;
                      
                        // Create the <p> element for the question text
                        const p = document.createElement('p');
                        p.textContent = QuestionData.Q.toLowerCase();
                      
                        // Create the <textarea> element for the answer
                        const textarea = document.createElement('textarea');
                        textarea.classList.add('form-control');
                        textarea.id = 'prompt';
                        textarea.rows = 4;
                        textarea.value = QuestionData.A;

                        textarea.onchange=(event)=>{
                            event.preventDefault()
                            QuestionData.A = event.target.value
                        }
                        questionDiv.appendChild(h2);
                        questionDiv.appendChild(p);
                        questionDiv.appendChild(textarea);
                        questionAnswerDetail.appendChild(questionDiv)
                        // Create a container <div> for the buttons
                        const buttonDiv = document.createElement('div');
                        buttonDiv.classList.add('mt-2');
                        buttonDiv.style.textAlign = 'center';
                        // Create the "Get Formatted Answer" button
                        const getFormattedAnswerButton = document.createElement('button');
                        getFormattedAnswerButton.style.margin = '9px 40px';
                        getFormattedAnswerButton.style.backgroundColor = 'rgba(58, 98, 175, 1)';
                        getFormattedAnswerButton.style.padding = '10px';
                        getFormattedAnswerButton.style.color = 'white';
                        getFormattedAnswerButton.style.borderRadius = '10px';
                        getFormattedAnswerButton.style.border = 'none';
                        getFormattedAnswerButton.textContent = 'Get Formatted Answer';
                        getFormattedAnswerButton.onclick= async(event)=>{
                            event.preventDefault()
                            Showmodal()
                                const url = "https://prod-01.canadacentral.logic.azure.com:443/workflows/5642aea7360b4e2abed05c109ca22ee1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=n67pAnB4zuGPWpAIyhMTqT9fMPdkLoFc0K8i9eFUfxg"
                                const Question= QuestionData.Q
                                const Answer = QuestionData.A
                            await shell.ajaxSafePost({
                                type: "POST",
                                contentType: "application/json; charset=UTF-8", // Include charset in Content-Type
                                url: url,
                                data: JSON.stringify({ Question, Answer }),
                                processData: false,
                                global: false,
                            }).done(function (body, textStatus, jqXHR) {
                                if (jqXHR.status === 200) {
                                    // Request was successful, process the response
                                    const result = Object.values(body)[0]
                                    QuestionData.A= result
                                    textarea.value= result
            
                                } else {
                                    // Handle non-200 status codes
                                    console.error("Request failed with status code: " + jqXHR.status);
                                }
                            }).fail(function (jqXHR, textStatus, errorThrown) {
                                // Handle the failure of the HTTP request
                                console.error("Request failed: " + errorThrown);
                            });
                            HideModal()

                        }
                        // Create the "Ask AI" button
                        const askAIButton = document.createElement('button');
                        askAIButton.style.margin  = '9px 40px';
                        askAIButton.style.padding = '10px 40px';
                        askAIButton.style.backgroundColor = 'rgba(58, 98, 175, 1)';
                       
                        askAIButton.style.color = 'white';
                        askAIButton.style.borderRadius = '10px';
                        askAIButton.style.border = 'none';
                        askAIButton.textContent = 'Ask AI';
                        askAIButton.onclick= async(event)=>{
                            event.preventDefault()
                            Showmodal()
                                const url = "https://prod-01.canadacentral.logic.azure.com:443/workflows/5642aea7360b4e2abed05c109ca22ee1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=n67pAnB4zuGPWpAIyhMTqT9fMPdkLoFc0K8i9eFUfxg"
                                const Question= concatenatedSectionResult + QuestionData.Q
                                const Answer = QuestionData.A +"Generate the answer from the above detail"
                            await shell.ajaxSafePost({
                                type: "POST",
                                contentType: "application/json; charset=UTF-8", // Include charset in Content-Type
                                url: url,
                                data: JSON.stringify({ Question, Answer }),
                                processData: false,
                                global: false,
                            }).done(function (body, textStatus, jqXHR) {
                                if (jqXHR.status === 200) {
                                    // Request was successful, process the response
                                    const result = Object.values(body)[0]
                                    QuestionData.A= result
                                    textarea.value= result
            
                                } else {
                                    // Handle non-200 status codes
                                    console.error("Request failed with status code: " + jqXHR.status);
                                }
                            }).fail(function (jqXHR, textStatus, errorThrown) {
                                // Handle the failure of the HTTP request
                                console.error("Request failed: " + errorThrown);
                            });
                            HideModal()

                        }
                        // Create the "Reset" button
                        const resetButton = document.createElement('button');
                        resetButton.style.margin  = '9px 40px';
                        resetButton.style.padding = '10px 40px';
                        resetButton.style.backgroundColor = 'rgba(58, 98, 175, 1)';
                        resetButton.style.color = 'white';
                        resetButton.style.borderRadius = '10px';
                        resetButton.style.border = 'none';
                        resetButton.textContent = 'Reset';
                        resetButton.onclick=(event)=>{
                            event.preventDefault()
                            textarea.value= QuestionData.P
                            QuestionData.A=QuestionData.P
                        }
                        // Append the buttons to the container <div>
                        buttonDiv.appendChild(getFormattedAnswerButton);
                        buttonDiv.appendChild(askAIButton);
                        buttonDiv.appendChild(resetButton);
                        // Append the container <div> to your HTML document where you want these buttons to appear
                        questionAnswerDetail.appendChild(buttonDiv);
                    })





                })


            });
        }
    }

    document.getElementById("CoverttoDoc").addEventListener("click", async (event) => {

        // Concat Standard Question
        let ConcatStandardQuestionResult = ''
        const QuestionAnswerStandardData = wholeDataArrayFormart[0].QuestionAnswer['Standard Question'];
        QuestionAnswerStandardData.map(data => {
            ConcatStandardQuestionResult += Object.keys(data)[0] + "\n"
            const questionAnswer = Object.values(data)[0];
            questionAnswer.map((qdata) => {
                const ExtractData = Object.values(qdata)[0]
                ConcatStandardQuestionResult += ExtractData.Q + "\n";
                ConcatStandardQuestionResult += ExtractData.A + "\n\n";
            })
        })
        // Concat Benefit Question
        let ConcatBenefitQuestionResult = ''
        const QuestionAnswerBenefitData = wholeDataArrayFormart[0].QuestionAnswer['Benefit Address'];
        QuestionAnswerBenefitData.map(data => {
            ConcatBenefitQuestionResult += Object.keys(data)[0] + "\n"
            const questionAnswer = Object.values(data)[0];
            questionAnswer.map((qdata) => {
                const ExtractData = Object.values(qdata)[0]
                ConcatBenefitQuestionResult += ExtractData.Q + "\n";
                ConcatBenefitQuestionResult += ExtractData.A + "\n\n";
            })
        })
        // Concat Addition Item to Address
        //  wholeDataArrayFormart[0].QuestionAnswer['Additional item to Address']
        let ConcatAdditionItemtoAddressResult = ''
        const QuestionAnswerAdditionalData = wholeDataArrayFormart[0].QuestionAnswer['Additional item to Address'];
        QuestionAnswerAdditionalData.map(data => {
            ConcatAdditionItemtoAddressResult += Object.keys(data)[0] + "\n"
            const questionAnswer = Object.values(data)[0]
            questionAnswer.map((qdata) => {
                const ExtractData = Object.values(qdata)[0]
                ConcatAdditionItemtoAddressResult += ExtractData.Q + "\n";
                ConcatAdditionItemtoAddressResult += ExtractData.A + "\n\n";
            })
        })
        //claimantForm
        const claimantform = sessionStorage.getItem("claimantForm")
        const claimantFormJson = JSON.parse(claimantform)
        Showmodal()
        var _url = "https://prod-03.canadacentral.logic.azure.com:443/workflows/b7d50b519d2f49d188ea345739ce8c36/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=q_GIETqYeIaaSoh27SvGDkLibkrx6Kiqf6dCTsQIX4w";
    await shell.ajaxSafePost({
        type: "POST",
        contentType:"application/json; charset=UTF-8", // Include charset in Content-Type
        url: _url,
        data: JSON.stringify({ claimantFormJson, concatenatedSectionResult, ConcatStandardQuestionResult, ConcatBenefitQuestionResult, ConcatAdditionItemtoAddressResult, AssessorId:AssessorId.toString() }),
        processData: false,
        global: false,
    }).done(function (body, textStatus, jqXHR) {
        if (jqXHR.status === 200) {
           let thelist = typeof body === 'string' ? JSON.parse(body) : body;
           window.location.href="/Load-Existing"
         
        } else {
            // Handle non-200 status codes
            console.error("Request failed with status code: " + jqXHR.status);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle the failure of the HTTP request
        console.error("Request failed: " + errorThrown);
});

        HideModal()
        

    })

})