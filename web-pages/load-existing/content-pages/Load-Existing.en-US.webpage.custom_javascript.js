$(document).ready( async () => {
    let thelist;
    const username = "{{user.fullname}}";
    const userId = "{{user.id}}";
    const userDetail= "{{user}}" 
    const dataString = JSON.stringify({ username:username });
    
    var _url = "https://prod-18.canadacentral.logic.azure.com:443/workflows/83fec12848274898ae38a3e844a40d0c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2Q_g22tMGMMOw-XL9V8yfqPR8W9CL6e9DU8gLU3IgDU";
    
    await shell.ajaxSafePost({
      type: "POST",
      contentType: "application/json; charset=UTF-8", // Include charset in Content-Type
      url: _url,
      data: dataString,
      processData: false,
      global: false,
    }).done(function (body, textStatus, jqXHR) {
      if (jqXHR.status === 200) {
        // Request was successful, process the response
        thelist = typeof body === 'string' ? JSON.parse(body) : body;
       
      } else {
        // Handle non-200 status codes
        console.error("Request failed with status code: " + jqXHR.status);
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      // Handle the failure of the HTTP request
      console.error("Request failed: " + errorThrown);
    });
    console.log(userDetail)
    console.log(userId)
    
    const listDataArray = Object.values(thelist.message)
    let reverselistDataArray= listDataArray.reverse();
    const tablebody = document.getElementById('tablebody')
    reverselistDataArray.forEach((item,index) => {
        const row = tablebody.insertRow();
        row.insertCell().textContent = item.Title+" "+item.ClaimantLastName;
        row.insertCell().textContent = item.DateofReport;
        row.insertCell().textContent = item.VendorCompany;
        row.insertCell().textContent = item.InsuranceCompany_x200b_;
        const downloadCell = row.insertCell();
        const downloadButton = document.createElement('a');
        downloadButton.textContent = "Download";
        downloadButton.href = Object.values(thelist.linkArray)[index];
        downloadButton.classList.add('btn');
        downloadButton.style = `background-color:rgba(58, 98, 175, 1); color: white;`
        downloadCell.appendChild(downloadButton);
    })

    document.getElementById("SearchItem").onchange=(event)=>{
        event.preventDefault()
        tablebody.innerHTML=""
        let result= event.target.value
        const filterarray =reverselistDataArray.filter(item => item.Title.toLowerCase().includes(result.toLowerCase()))
        filterarray.forEach((item,index) => {
          const row = tablebody.insertRow();
          row.insertCell().textContent = item.Title;
          row.insertCell().textContent = item.DateofReport;
          row.insertCell().textContent = item.VendorCompany;
          row.insertCell().textContent = item.InsuranceCompany_x200b_;
          const downloadCell = row.insertCell();
          const downloadButton = document.createElement('a');
          downloadButton.textContent = "Download";
          downloadButton.href = Object.values(thelist.linkArray)[index];
          downloadButton.classList.add('btn');
          downloadButton.style = `background-color:rgba(58, 98, 175, 1); color: white;`
          downloadCell.appendChild(downloadButton);
      })

    }
})