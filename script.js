var fileData = [];

var minDate;
var maxDate;

$("#file").change(function() {
    var reader = new FileReader();
    reader.onload = function(){
        var text = reader.result;
        var list = text.split("\n");
        list.splice(0,1);
        list.splice(list.length-2,2);
        list.reverse();
        var t = "";
        data = [];
        list.forEach(v => {
            row = v.split(",").map(x => {return x.slice(1,-1);});
            row = {
                "date":row[0],
                "title":row[1],
                "price":parseFloat(row[2].slice(1)),
                "qty":parseInt(row[3]),
                "sum":parseFloat(row[4].slice(1))
            };
            fileData.push(row);
        });

        minDate = new Date(fileData["0"]["date"]);
        maxDate = new Date(fileData[fileData.length-1]["date"]);
    
        $(".datepicker").datepicker({
            "dateFormat":"yy-mm-dd",
            "minDate": minDate, 
            "maxDate": maxDate
        });
        $("#from").datepicker("option", "defaultDate", minDate);
        $("#to").datepicker("option", "defaultDate", maxDate);

        listBetween();

    };
    reader.readAsText($("#file").prop("files")[0]);
});

$("#from").change(function() {
    t = new Date($(this).val());
    $("#to").datepicker("option", "minDate", t);
    listBetween();
});

$("#to").change(function() {
    t = new Date($(this).val());
    $("#from").datepicker("option", "maxDate", t);
    listBetween();
});

function listBetween() {
        var from = new Date($("#from").val());
        var to = new Date($("#to").val());

        var t = "";
        data = [];
        for(var k in fileData) {
            var v = fileData[k];
            var cur = new Date(v.date);
            if(from > cur || cur > to) {
                continue;
            }
            if(v["title"] in data) {
                data[v["title"]]["list"].push(v);
                data[v["title"]]["qty"] += v["qty"];
                data[v["title"]]["sum"] += v["sum"];
            } else {
                data[v["title"]] = {
                    "title":v["title"],
                    "qty":v["qty"],
                    "sum":v["sum"],
                    "list":[v]
                };
            }
            
            t += 
            "<tr>" + 
            Object.values(v)
                .map(x => {return "<td>" + x + "</td>";})
                .join("")
            + "</tr>";
        }
        $("#list").html(t);

        t = "";
        // console.log(data);
        for(k in data)
        {
            v = data[k];
            t += "<tr>" +
            "<td>" + v["title"]  + "</td>" +
            "<td>" + v["qty"]  + "</td>" +
            "<td>$" + v["sum"].toFixed(2)  + "</td>" +
            "<td>$" + (v["sum"]*0.88).toFixed(2)  + "</td>" +
            "</tr>";
        }
        $("#sumlist").html(t);

        slices = [];
        labels = [];
        for(k in data) {
            v = data[k];
            slices.push(v["sum"]);
            labels.push(v["title"]);
        }

        console.log(labels);

        var ctx = $("#test");
        var test = new Chart(ctx,{
            type: 'pie',
            data: {
                datasets:[{
                    data:slices  
                }]
            },
            labels:labels
        });
}
// $(document).ready(function() {
//     var ctx = $("#test");
//         var test = new Chart(ctx,{
//             type: 'pie',
//             data: {
//                 datasets:[{
//                     data:[3,4,5,6]  
//                 }]
//             }
//         });
// });