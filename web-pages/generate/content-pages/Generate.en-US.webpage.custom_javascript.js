$(document).ready(() => {
   sessionStorage.clear();
   const username = "{{user.fullname}}"
   // <------------------------------ Initialize the Global Variables -------------------------------------->

   let fullTranscription; // full transcription with HTML
   let fullTranscriptionPlainText;     // full transcription without HTML (Plain Text)
   let sectionNames;      // Section Names array
   let sectionCollection = []; // section collection have section names and extracted data
   let benefitAddressOptions = [];
   let extractedBenefitData = []; // Array to store extracted texts for each selected option
   let getTheQuestions;  // for the sharepoint list 
   let BenefitAddressQuestion = [];
   let combinedDataStandardAddress=[];
   let StandardAddressOption = ["Standard Questions"];
   let extractedStandardAddressData = [];
   let StandardAddressQuestions = []
   let combinedDataBenefitAddress = []
   let extractedAdditionalItemtoAddressData = []

   let AdditionalItemtoAddressOptions = [];
   let AdditionalItemtoAddressQuestions = []
   let combinedDataAdditionItemAddress = []
   let getAiReport;
   // <------------------------------ Benefit Address Array  -------------------------------------->

   document.getElementById('benefit_address').addEventListener('change', function () {
      benefitAddressOptions = Array.from(this.selectedOptions); // Get all selected options
   });
   // <------------------------------ Additonial Item to Address  -------------------------------------->
   document.getElementById('additional_item_to_address').addEventListener('change', function () {
      AdditionalItemtoAddressOptions = Array.from(this.selectedOptions); // Get all selected options
   });
   // insurance array 
   const InsuranceCompanyArray = [
      "Intact"
   ]
   // Vendor Company Array 
   const VendorCompanyArray = [
      "Axia Health"
   ]
   // insurance add option logic
   const insuranceComapany = document.getElementById('insurance_company')
   for (let i = 0; i < InsuranceCompanyArray.length; i++) {
      const option = document.createElement("option")
      option.value = InsuranceCompanyArray[i]
      option.innerText = InsuranceCompanyArray[i]
      insuranceComapany.appendChild(option)
   }
   // Vendor Company option Logic
   const vendorCompany = document.getElementById('vendor_company')
   for (let i = 0; i < VendorCompanyArray.length; i++) {
      const option = document.createElement("option")
      option.value = VendorCompanyArray[i]
      option.innerText = VendorCompanyArray[i]
      vendorCompany.appendChild(option)
   }

   const Showmodal = () => {
      $('#loader-overlay').show();
      $('#loader').modal('show');
   }

   // Hide the loading modal
   const HideModal = () => {
      $('#loader-overlay').hide();
      $('#loader').modal('hide');
   }
   // <------------------------------ Read the Uploaded File  -------------------------------------->
   document.getElementById('Transcription/Notes').addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = function (e) {
            const docxData = e.target.result;
            mammoth.convertToHtml({ arrayBuffer: docxData })
               .then(displayResult)
               .catch((e) => {
                  console.log(e)
               });
         };
         reader.readAsArrayBuffer(file);
      }
   });
   // <------------------------------ displayResult -------------------------------------->
   function displayResult(result) {
      fullTranscription = result.value;
      fullTranscriptionPlainText = extractTextFromHtml(fullTranscription);
      // Extracted the Sections Name from the Plain Text and save it in Array
      sectionNames = Array.from(new Set(
         fullTranscriptionPlainText.match(/(Section \d+:\s+[A-Za-z ]+)/g)
      ));

      sectionCollection = [];

      // Extracted the Substring between the Sections Name and save it in SectionCollection Array
      for (let i = 0; i < sectionNames.length; i++) {
         const sectionName = sectionNames[i];
         const data = extractDataBetweenSections(fullTranscriptionPlainText, sectionName, sectionNames[i + 1]);

         sectionCollection.push({
            [sectionName]: {
               data: data,
               aiReport: '',
               previousData: ""
            }
         });
      }
      console.log(sectionCollection);
   }
   //Extracted the Substring between the Sections Names
   function extractDataBetweenSections(text, startSection, endSection) {
      let startIndex = text.indexOf(startSection);
      let endIndex = endSection ? text.indexOf(endSection) : "{END OF DOCUMENT}";

      if (startIndex === -1 || (endSection && endIndex === -1)) {
         return null;
      }
      startIndex += startSection.length;
      if (!endSection) {
         return text.slice(startIndex).trim();
      }
      return text.slice(startIndex, endIndex).trim(); // extract and return the data between the sections
   }
   // Extracted the Plain text from HTML
   function extractTextFromHtml(htmlString) {
      let parser = new DOMParser();
      let doc = parser.parseFromString(htmlString, 'text/html');
      return doc.body.textContent || "";
   }
   var InsuranceCompany = document.getElementById("insurance_company").value;
   var _getQuestionurl = "https://prod-06.canadacentral.logic.azure.com:443/workflows/45f8153a9c4242d1967581e054e765bb/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=eWYSPTDIhEiPP7twVOHEr1aYn6_iXQ74hWllwmfQ0mE";
   shell.ajaxSafePost({
      type: "POST",
      contentType: "application/json",
      url: _getQuestionurl,
      data: JSON.stringify(InsuranceCompany),
      processData: false,
      global: false,
   }).done(
      function (response) {
         getTheQuestions = typeof response === 'string' ? JSON.parse(response) : response;

      }).fail(function () {
         alert("failed")
      });
   console.log(getTheQuestions);
   // on change property of Claimant id type 
   const confirmationTypeDropdown = document.getElementById("claimant_confirmation_of_id_Type");
   const otherConfirmationContainer = document.getElementById("claimant_other_confirmation_container");

   confirmationTypeDropdown.addEventListener("change", function () {
      if (confirmationTypeDropdown.value === "Other") {
         otherConfirmationContainer.style.display = "block";
      } else {
         otherConfirmationContainer.style.display = "none";
      }
   });
   // on Change Price of disput 
   const priceOfdisputeChange = document.getElementById("price_of_dispute")
   priceOfdisputeChange.onchange=(event)=>{
      priceOfdisputeChange.value= event.target.value
   }

   // on change property of document of dispute
   const documentInDisputeSelect = document.getElementById("document_in_dispute");
   const dateOfDisputeGroup = document.getElementById("date_of_dispute_group");
   const priceOfDisputeGroup = document.getElementById("price_of_dispute_group");

   documentInDisputeSelect.addEventListener("change", function () {
      if (documentInDisputeSelect.value === "OCF-18,DATE,Amount($)") {
         dateOfDisputeGroup.style.display = "block";
         priceOfDisputeGroup.style.display = "block";
      } else {
         dateOfDisputeGroup.style.display = "none";
         priceOfDisputeGroup.style.display = "none";
      }
   });
   /// Error MEssage Functiion
   function showErrorMessage(id, Message) {
      const group = document.getElementById(id);
      let element = group.querySelector("p"); // Check for an existing error message element
    
      if (!element) {
        element = document.createElement('p');
        element.style.fontSize = "16px";
        element.style.color = "darkred";
        group.appendChild(element);
      }
    
      element.innerText = Message; // Set or update the error message text
   }


   // NextButton Click 
   document.getElementById("NextButton").addEventListener("click", async (event) => {

      // form variable 
      var ClaimantFirstName = document.getElementById("claimant_first_name").value;
      var bundleType = document.getElementById("claimant_bundle_type").value
      var ClaimantLastName = document.getElementById("claimant_last_name").value;
      var DateOfBirth = document.getElementById("date_of_birth").value;
      var Gender = document.getElementById("claimaint_gender").value;
      var Claimant_Pronoun = document.getElementById("claimant_pronoun").value;
      var DateOfLoss = document.getElementById("date_of_loss").value;
      var ConfirmationOfIDType = document.getElementById("claimant_confirmation_of_id_Type").value;
      var OtherConfirmationOfID = document.getElementById("claimant_other_confirmation_id_type").value
      var TypeOfAssessment = document.getElementById("type_of_assessment").value;
      var DateOfAssessment = document.getElementById("date_of_assessment").value;
      var AssessmentLocation = document.getElementById("assessment_location").value;
      var DurationOfAssessment = document.getElementById("duration_of_Assessment").value;
      var InsuranceCompany = document.getElementById("insurance_company").value;
      var VendorCompany = document.getElementById("vendor_company").value;
      var BenefitAddress = document.getElementById("benefit_address").value;
      var AdditionalItemstoAddress = document.getElementById("additional_item_to_address").value;
      var DocumentInDispute = document.getElementById("document_in_dispute").value;
      var DateOfDispute = document.getElementById("date_of_dispute").value;
      var ClaimNumber = document.getElementById("claimant_claim_number").value;
      var FirstandLastNameOfReferral = document.getElementById("first_and_last_name_of_referral_source").value;
      var DateofReport = document.getElementById("date_of_report").value;
      var ReportType = document.getElementById("report_type").value;
      var GeneratedReportAs = document.getElementById("generated_report_as").value;
      var languageInterpraterPresentOrNot = document.getElementById('language_interpreter_present').value;
      var IdNumber = document.getElementById("Id_number").value
      var WasIntakeAssistentPresentorNot = document.getElementById('intake_assistant_present').value
      var Transcription_Notes= document.getElementById("Transcription/Notes").value
      const dateOfDisputeObj = new Date(DateOfDispute);
      const DateOfLossObj= new Date(DateOfLoss)
      const DateofReportObj = new Date(DateofReport)
      const DateOfBirthObj= new Date(DateOfBirth)
      const DateOfAssessmentObj = new Date(DateOfAssessment)

       // Get the current date
       const currentDate = new Date();

      const claimantData = {
         ClaimantFirstName: ClaimantFirstName,
         bundleType: bundleType,
         ClaimantLastName: ClaimantLastName,
         DateOfBirth: DateOfBirth,
         Gender: Gender,
         Claimant_Pronoun: Claimant_Pronoun,
         DateOfLoss: DateOfLoss,
         ConfirmationOfIDType: ConfirmationOfIDType,
         OtherConfirmationOfID: OtherConfirmationOfID,
         TypeOfAssessment: TypeOfAssessment,
         DateOfAssessment: DateOfAssessment || Date.now().toFixed,
         AssessmentLocation: AssessmentLocation,
         DurationOfAssessment: DurationOfAssessment,
         InsuranceCompany: InsuranceCompany,
         VendorCompany: VendorCompany,
         BenefitAddress: BenefitAddress,
         AdditionalItemstoAddress: AdditionalItemstoAddress,
         DocumentInDispute: DocumentInDispute,
         PriceOfDispute: priceOfdisputeChange.value,
         DateOfDispute: DateOfDispute,
         ClaimNumber: ClaimNumber,
         FirstandLastNameOfReferral: FirstandLastNameOfReferral,
         DateofReport: DateofReport,
         ReportType: ReportType,
         GeneratedReportAs: GeneratedReportAs,
         languageInterpraterPresentOrNot: languageInterpraterPresentOrNot,
         IdNumber: IdNumber,
         WasIntakeAssistentPresentorNot: WasIntakeAssistentPresentorNot,
         username
      };
      if (
         ClaimantFirstName === "" ||
         ClaimantLastName === "" ||
         DateOfBirth === "" ||
         DurationOfAssessment === "" ||
         ClaimNumber === "" ||
         FirstandLastNameOfReferral === "" ||
         DateOfLoss === "" ||
         AssessmentLocation === "" ||
         DateOfAssessment === "" ||
         BenefitAddress === "" ||
         AdditionalItemstoAddress === "" ||
         DateofReport==="" ||
         Transcription_Notes===""||
         DateOfBirthObj>currentDate||
         DateOfAssessmentObj>currentDate||
         DateOfLossObj>currentDate
         
       ) {
      if (ClaimantFirstName === "") {
         showErrorMessage("claimant_first_name_group", "Claimant First Name is Empty");
      } if (ClaimantLastName === "") {
         showErrorMessage("claimant_last_name_group", "Claimant Last Name is Empty");
      } if (DateOfBirth === "") {
         showErrorMessage("date_of_birth_group", "Date of Birth is Empty");
      } if (DurationOfAssessment === "") {
         showErrorMessage("duration_of_Assessment_group", "Duration of Assessment is Empty");
      } if (ClaimNumber === "") {
         showErrorMessage("claimant_claim_number_group", "Claim Number is Empty");
      } if (FirstandLastNameOfReferral === "") {
         showErrorMessage("first_and_last_name_of_referral_source_group", "Referral Name is Empty");
      } if (DateOfLoss === "") {
         showErrorMessage("date_of_loss_group", "Date of Loss is Empty");
      } if (AssessmentLocation === "") {
         showErrorMessage("assessment_location_group", "Assessment Location is Empty");
      } if (DateOfAssessment === "") {
         showErrorMessage("date_of_assessment_group", "Date of Assessment is Empty");
      } if (BenefitAddress === "") {
         showErrorMessage("benefit_address_group", "Benefit Address is Empty");
      } if (AdditionalItemstoAddress === "") {
         showErrorMessage("additional_item_to_address_group", "Additional Items to Address is Empty");
      } if (DateofReport === "") {
         showErrorMessage("date_of_report_group", "Date of Report is Empty")
      } if(DateofReportObj > currentDate){
         showErrorMessage("date_of_report_group", "Date of report should be less then current date")
      }if(DateOfBirthObj>currentDate){
         showErrorMessage("date_of_birth_group", "Date of Birth should be less then current date");
      }if(DateOfLossObj>currentDate){
         showErrorMessage("date_of_loss_group", "Date of Loss should be less then current date");
      }if(DateOfAssessmentObj>currentDate){
         showErrorMessage("date_of_assessment_group", "Date of Assessment should be less then current date");
      } if(dateOfDisputeObj!== "" && dateOfDisputeObj>currentDate){
         showErrorMessage("date_of_dispute_group", "Date of dispute should be less then current date");
      }if(Transcription_Notes===""){
         showErrorMessage("Transcription/Notes_group", "Upload Your Transcription/Notes")
      }
      
   }
      else {
         Showmodal();

         if (TypeOfAssessment = "In-Person") {
            // get the standard Address from the data
            StandardAddressOption.forEach(option => {
               const Standard = option ?? '';
               const StandardStartTag = "Standard Questions: " + Standard;
               const StandardEndTag = "Ending: " + Standard;
               const startIdx = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].indexOf(StandardStartTag) + 21;
               const endIdx = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].indexOf(StandardEndTag);

               if (startIdx !== -1 && endIdx !== -1) {
                  const extractedText = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].slice(startIdx, endIdx).trim();
                  extractedStandardAddressData.push({
                     [Standard]: {
                        Data: extractedText
                     },
                  });
               } else {
                  console.error('Error: Substrings not found for', Standard);
               }
               console.log("extractedBenefitData", extractedStandardAddressData)
            });

            // Extract the Answer from the extractedStandardAddressData


            const extractedStandardAnswersArray = extractedStandardAddressData.map(entry => {
               let i = 0;
               const answersRegex = /(Ans \d+: .*?)(?=Ans \d+:|$)/g; // Regular expression to capture each "Ans [number]: [text]" block
               const answers = [];
               let match;
               while ((match = answersRegex.exec(Object.values(entry)[0].Data)) !== null) {
                  answers.push(match[1].trim());
               }
               const keyAnswerHeading = Object.keys(entry)[0]
               console.log("entry ", entry)
               return {
                  [keyAnswerHeading]: {
                     [`A`]: answers
                  }
               };
            });
            if (getTheQuestions !== undefined) {

               StandardAddressOption.forEach(option => {
                  const Standard = option ?? ''; // Value of the selected option
                  const StandardStartTag = "Standard Questions: " + Standard;
                  const StandardEndTag = "Ending: " + Standard;
                  const startIdx = getTheQuestions['message'].indexOf(StandardStartTag) + 21;
                  const endIdx = getTheQuestions['message'].indexOf(StandardEndTag);

                  if (startIdx !== -1 && endIdx !== -1) {
                     StandardAddressQuestions.push({
                        [Standard]: {
                           Question: getTheQuestions['message'].slice(startIdx, endIdx).trim()
                        },
                     });
                  } else {
                     console.error('Error: Substrings not found for', Standard);
                  }
               });
            }

            // Extracting the Standard Address Question
            const extractedStandardQuestions = StandardAddressQuestions.map(entry => {
               let i = 0;
               // Updated regular expression to consider whitespaces and special characters around the "Q[number]:" pattern
               const questionsRegex = /(Q\d+:\s*.*?)(?=\s*Q\d+:|$)/gs;
               const questions = [];
               let match;
               while ((match = questionsRegex.exec(Object.values(entry)[0].Question)) !== null) {
                  questions.push(match[1].trim());
               }
               const keyQuestionHeading = Object.keys(entry)[0]
               return {
                  [keyQuestionHeading]: {
                     [`Q`]: questions
                  },

               };
            });

            // combining the standard Question and Answer 
            combinedDataStandardAddress = extractedStandardAnswersArray.map(answerEntry => {
               const correspondingQuestionEntry = extractedStandardQuestions.find(qEntry => Object.keys(qEntry)[0] === Object.keys(answerEntry)[0]);
               if (!correspondingQuestionEntry) {
                  return null; // or handle this scenario as you see fit
               }
               const Questionheading = Object.keys(correspondingQuestionEntry)[0]
               const questionsAndAnswers = Object.values(correspondingQuestionEntry)[0].Q.map((question, index) => {
                  return {
                     [`Question`]: {
                        Q: question,
                        A: answerEntry[Questionheading].A[index] || "No answer provided",
                        P: answerEntry[Questionheading].A[index] || "No answer provided"
                     }// Handle cases where there might not be an answer for a question
                  };
               });

               return {
                  [Questionheading]: questionsAndAnswers

               };
            }).filter(Boolean);


         }
         // get the question from the sharepoint list data  for Standard Question

         if (!benefitAddressOptions.includes("Not Applicable")) {
            // Benefit Address Data Array 
            benefitAddressOptions.forEach(option => {
               const benefit = option.value ?? '';
               const benefitStartTag = "Benefit Address: " + benefit;
               const benefitEndTag = "Ending: " + benefit;
               const startIdx = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].indexOf(benefitStartTag) + benefitStartTag.length;
               const endIdx = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].indexOf(benefitEndTag);

               if (startIdx !== -1 && endIdx !== -1) {
                  const extractedText = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].slice(startIdx, endIdx).trim();
                  extractedBenefitData.push({
                     [benefit]: {
                        Data: extractedText
                     },
                  });
               } else {
                  console.error('Error: Substrings not found for', benefit);
               }
               console.log("extractedBenefitData", extractedBenefitData)
            });
            // extract benefit data Answer Array 
            const extractedBenefitAddressAnswer = extractedBenefitData.map(entry => {
               let i = 0;
               const answersRegex = /(Ans \d+: .*?)(?=Ans \d+:|$)/g; // Regular expression to capture each "Ans [number]: [text]" block
               const answers = [];
               let match;
               while ((match = answersRegex.exec(Object.values(entry)[0].Data)) !== null) {
                  answers.push(match[1].trim());
               }
               const keyAnswerHeading = Object.keys(entry)[0]
               console.log("entry ", entry)
               return {
                  [keyAnswerHeading]: {
                     [`A`]: answers
                  }
               };
            });


            console.log("extractedBenefitAddressAnswer", extractedBenefitAddressAnswer);
            // Extracting the Benefit Address from the get Question Json
            if (getTheQuestions !== undefined) {

               benefitAddressOptions.forEach(option => {
                  const benefit = option.value ?? ''; // Value of the selected option
                  const benefitStartTag = "Benefit Address: " + benefit;
                  const benefitEndTag = "Ending: " + benefit;
                  const startIdx = getTheQuestions['message'].indexOf(benefitStartTag) + benefitStartTag.length;
                  const endIdx = getTheQuestions['message'].indexOf(benefitEndTag);

                  if (startIdx !== -1 && endIdx !== -1) {
                     BenefitAddressQuestion.push({
                        [benefit]: {
                           Question: getTheQuestions['message'].slice(startIdx, endIdx).trim()
                        },
                     });
                  } else {
                     console.error('Error: Substrings not found for', benefit);
                  }
               });
               console.log(BenefitAddressQuestion)
            }
            // Extracting the Benefit Address Question
            const extractedBenefitQuestions = BenefitAddressQuestion.map(entry => {
               let i = 0;
               // Updated regular expression to consider whitespaces and special characters around the "Q[number]:" pattern
               const questionsRegex = /(Q\d+:\s*.*?)(?=\s*Q\d+:|$)/gs;
               const questions = [];
               let match;
               while ((match = questionsRegex.exec(Object.values(entry)[0].Question)) !== null) {
                  questions.push(match[1].trim());
               }
               const keyQuestionHeading = Object.keys(entry)[0]
               return {
                  [keyQuestionHeading]: {
                     [`Q`]: questions
                  },

               };
            });
            console.log("ExtractedBenefitAddressQuestion", extractedBenefitQuestions)

            // Combining the benefit Question and Answer
            combinedDataBenefitAddress = extractedBenefitAddressAnswer.map(answerEntry => {
               const correspondingQuestionEntry = extractedBenefitQuestions.find(qEntry => Object.keys(qEntry)[0] === Object.keys(answerEntry)[0]);
               if (!correspondingQuestionEntry) {
                  return null; // or handle this scenario as you see fit
               }
               const Questionheading = Object.keys(correspondingQuestionEntry)[0]
               const questionsAndAnswers = Object.values(correspondingQuestionEntry)[0].Q.map((question, index) => {
                  return {
                     [`Question`]: {
                        Q: question,
                        A: answerEntry[Questionheading].A[index] || "No answer provided",
                        P: answerEntry[Questionheading].A[index] || "No answer provided"
                     }// Handle cases where there might not be an answer for a question
                  };
               });

               return {
                  [Questionheading]: questionsAndAnswers

               };
            }).filter(Boolean); // This will filter out any null entries

         }

         if (!AdditionalItemtoAddressOptions.includes("Not Applicable")) {
            // Extract the  Addtition item to Address part from the Transcription 
            AdditionalItemtoAddressOptions.forEach(option => {
               const Addtition = option.value ?? '';
               const AddtitionStartTag = "Additional Items to Address: " + Addtition;
               const AddtitionEndTag = "Ending: " + Addtition;
               const startIdx = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].indexOf(AddtitionStartTag) + AddtitionStartTag.length;
               const endIdx = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].indexOf(AddtitionEndTag);

               if (startIdx !== -1 && endIdx !== -1) {
                  const extractedText = Object.values(sectionCollection[sectionCollection.length - 1])[0]['data'].slice(startIdx, endIdx).trim();
                  extractedAdditionalItemtoAddressData.push({
                     [Addtition]: {
                        Data: extractedText
                     },
                  });
               } else {
                  console.error('Error: Substrings not found for', Addtition);
               }
               console.log("extractedAdditionalItemtoAddressData", extractedAdditionalItemtoAddressData)
            });

            // the Addition item to Address Array 
            const extractedAdditionItemtoAddressAnswer = extractedAdditionalItemtoAddressData.map(entry => {
               let i = 0;
               const answersRegex = /(Ans \d+: .*?)(?=Ans \d+:|$)/g; // Regular expression to capture each "Ans [number]: [text]" block
               const answers = [];
               let match;
               while ((match = answersRegex.exec(Object.values(entry)[0].Data)) !== null) {
                  answers.push(match[1].trim());
               }
               const keyAnswerHeading = Object.keys(entry)[0]
               console.log("entry ", entry)
               return {
                  [keyAnswerHeading]: {
                     [`A`]: answers
                  }
               };
            });
            //  get the Addition item to Address  Question from json
            if (getTheQuestions !== undefined) {

               AdditionalItemtoAddressOptions.forEach(option => {
                  const AdditionalItem = option.value ?? ''; // Value of the selected option
                  const AdditionalItemStartTag = "Additional Items to Address: " + AdditionalItem;
                  const AdditionalItemEndTag = "Ending: " + AdditionalItem;
                  const startIdx = getTheQuestions['message'].indexOf(AdditionalItemStartTag) + AdditionalItemStartTag.length;
                  const endIdx = getTheQuestions['message'].indexOf(AdditionalItemEndTag);

                  if (startIdx !== -1 && endIdx !== -1) {
                     AdditionalItemtoAddressQuestions.push({
                        [AdditionalItem]: {
                           Question: getTheQuestions['message'].slice(startIdx, endIdx).trim()
                        },
                     });
                  } else {
                     console.error('Error: Substrings not found for', AdditionalItem);
                  }
               });
               console.log(AdditionalItemtoAddressQuestions)
            }
            // Extract the Addition item to Address Question
            const extractedAdditionalItemQuestions = AdditionalItemtoAddressQuestions.map(entry => {
               let i = 0;
               // Updated regular expression to consider whitespaces and special characters around the "Q[number]:" pattern
               const questionsRegex = /(Q\d+:\s*.*?)(?=\s*Q\d+:|$)/gs;
               const questions = [];
               let match;
               while ((match = questionsRegex.exec(Object.values(entry)[0].Question)) !== null) {
                  questions.push(match[1].trim());
               }
               const keyQuestionHeading = Object.keys(entry)[0]
               return {
                  [keyQuestionHeading]: {
                     [`Q`]: questions
                  },

               };
            });
            // Question and Answer of the Additional item to address
            combinedDataAdditionItemAddress = extractedAdditionItemtoAddressAnswer.map(answerEntry => {
               const correspondingQuestionEntry = extractedAdditionalItemQuestions.find(qEntry => Object.keys(qEntry)[0] === Object.keys(answerEntry)[0]);
               if (!correspondingQuestionEntry) {
                  return null; // or handle this scenario as you see fit
               }
               const Questionheading = Object.keys(correspondingQuestionEntry)[0]
               const questionsAndAnswers = Object.values(correspondingQuestionEntry)[0].Q.map((question, index) => {
                  return {
                     [`Question`]: {
                        Q: question,
                        A: answerEntry[Questionheading].A[index] || "No answer provided",
                        P: answerEntry[Questionheading].A[index] || "No answer provided"
                     }// Handle cases where there might not be an answer for a question
                  };
               });

               return {
                  [Questionheading]: questionsAndAnswers

               };
            }).filter(Boolean); // This will filter out any null entries

            console.log("combinedDataAdditionItemAddress", combinedDataAdditionItemAddress)
         }

         // if the Type of Assessment is in person enable the Standard Question //

         // for the generated Ai Report

         sectionCollection = sectionCollection.slice(0, -1);
       
         for (let i = 0; i < sectionCollection.length; i++) {
            let sectionName = Object.keys(sectionCollection[i])[0];
            let sectionData = Object.values(sectionCollection[i])[0]
            const promptString = "Re-word this " + ReportType + " between a doctor, who is specialized in " + "some field" + " and a " + Gender + " claimant, which describes the " + sectionName + " resulting from the accident in question, described in this previous prompt string, into a detailed narrative description written in medical or legal format. Write the paragraph in the " + document.getElementById("generated_report_as").value;
            let concatData='['
            for (let i = 0; i < sectionCollection.length; i++) {
               let sectionAiReporti = (i - 1 >= 0) ? Object.values(sectionCollection[i - 1])[0].aiReport : '';
               
              concatData += `{
                 "role": "assistant",
                 "content": "${sectionAiReporti}"
               },`;
             }
             concatData += `{
               "role":"assistant",
               "content":" ${promptString} ${anonymizeData(sectionData.data)}"

             }]`
            let response = await sendToChatGPT(concatData);
            console.log(response);
            getAiReport = deanonymizeData(response['message']);

            // Push the response into sectionCollection at the current index
            Object.values(sectionCollection[i])[0].aiReport = getAiReport;
            Object.values(sectionCollection[i])[0].previousData = getAiReport
         }

         // -------------------------- Send to ChatGpt --------------------------------------


         async function sendToChatGPT(sectionPreviousAiReport) {
          

            const dataToSend = {
               "PreviousAiReport": sectionPreviousAiReport,
            };
            var chatGpt = "https://prod-07.canadacentral.logic.azure.com:443/workflows/7e445693bd5a4ead9def9fcbe4b4f28c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZW8fgu7JDWa9fiY7foQYJjY-Z2mp4ul0nwHFDK3zaFs";
            return await shell.ajaxSafePost({
               type: "POST",
               contentType: "application/json",
               url: chatGpt,
               data: JSON.stringify(dataToSend),
               processData: false,
               global: false
            }).done(function (response) {
               getAiReport = typeof response === 'string' ? JSON.parse(response) : response;
               console.log(getAiReport);

            }).fail(function () {
               alert("failed")
            });
         }

         console.log("section-Collection", sectionCollection)
         // helper for anonymizeing the Data
         function anonymizeData(data) {
            return data.replace(username, 'Doctor X').replace(ClaimantFirstName, 'Patient X');
         }

         function deanonymizeData(data) {
            return data.replace('Doctor X', "Stuart Siegel").replace('Patient X', ClaimantFirstName);
         }
         HideModal();

         const wholeDataArray = [{
            sections: sectionCollection,
            QuestionAnswer: {
               ...(combinedDataStandardAddress && { "Standard Question": combinedDataStandardAddress }),
               ...(combinedDataBenefitAddress && { "Benefit Address": combinedDataBenefitAddress }),
               ...(combinedDataAdditionItemAddress && { "Additional item to Address": combinedDataAdditionItemAddress })
            }

         }]

         console.log("wholeData", wholeDataArray)

         // Combining question and answer of Benefit Address 

         // Convert the object to a JSON string
         var claimantDataJSON = JSON.stringify(claimantData);
         var wholeDataArrayJson = JSON.stringify(wholeDataArray)

         // Store the JSON string in sessionStorage
         sessionStorage.setItem("claimantForm", claimantDataJSON);
         sessionStorage.setItem("wholeDataArray", wholeDataArrayJson);
         window.location.href = "/generated-transcription";
      }


   })
   // Create an object and assign variables to its properties





})