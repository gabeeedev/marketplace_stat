var fileData = [];
var summary = [];

var minDate;
var maxDate;

// var last = {
//     from:minDate,
//     to:maxDate,
//     interval
// }

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
                "date":new Date(row[0]),
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
            "maxDate": maxDate,
            changeMonth: true,
            changeYear: true
            
        });
        $("#from").datepicker("setDate", minDate);
        $("#to").datepicker("setDate", maxDate);

        getData();

    };
    reader.readAsText($("#file").prop("files")[0]);
});

$("#from").change(function() {
    t = new Date($(this).val());
    $("#to").datepicker("option", "minDate", t);
    getData();
});

$("#to").change(function() {
    t = new Date($(this).val());
    $("#from").datepicker("option", "maxDate", t);
    getData();
});

$(".datesetter").click(function() {
    var interval = $(this).attr("interval");
    max = new Date(maxDate);
    min = new Date(max);
    min.setDate(min.getDate()-interval);
    $("#from").datepicker("setDate", min);
    $("#to").datepicker("setDate", max);
    getData();
});

function getData() {
    var from = new Date($("#from").val());
    var to = new Date($("#to").val());
    summary = [];
    var t = "";
    for(var k in fileData) {
        var v = fileData[k];
        var cur = new Date(v.date);
        if(from > cur || cur > to) {
            continue;
        }
        if(v["title"] in summary) {
            summary[v["title"]]["list"].push(v);
            summary[v["title"]]["qty"] += v["qty"];
            summary[v["title"]]["sum"] += v["sum"];
        } else {
            summary[v["title"]] = {
                "title":v["title"],
                "qty":v["qty"],
                "sum":v["sum"],
                "list":[v],
                "visible":true
            };
        }
        
        t += 
        "<tr>" + 
            [v["date"].toISOString("yy-mm-dd").split("T")[0],
            v["title"],
            "$" + v["price"],
            v["qty"],
            "$" + v["sum"]].map(x => "<td>" + x + "</td>").join()
        + "</tr>";
    }
    $("#list").html(t);

    t = [];
    for(k in summary) {
        t.push(summary[k]);
    }
    summary = t;

    getVisual();
}

function generalCompare(a,b,dir) {
    return a<b?-dir:dir;
}

$(".sort").click(function() {
    var dir = $(this).attr("sort-dir");
    var data = $(this).attr("sort-data");
    summary.sort((a,b) => generalCompare(a[data],b[data],dir=="asc"?1:-1));

    $(this).attr("sort-dir",dir=="asc"?"desc":"asc");
    $(this).removeClass(dir=="asc"?"fa-sort-up":"fa-sort-down");
    $(this).addClass(dir=="asc"?"fa-sort-down":"fa-sort-up");

    getVisual();
});

var charts = [];
function getVisual() {
    t = "";
    // console.log(summary);
    for(k in summary)
    {
        v = summary[k];
        t += "<tr>" +
        "<td><input type='checkbox' class='checker' " + (v['visible']?'checked':'') + " tar='" + k + "'></td>" + 
        "<td>" + v["title"]  + "</td>" +
        "<td>" + v["qty"]  + "</td>" +
        "<td>$" + v["sum"].toFixed(2)  + "</td>" +
        "<td>$" + (v["sum"]*0.88).toFixed(2)  + "</td>" +
        "</tr>";
    }
    $("#sumlist").html(t);

    slices = [];
    labels = [];
    for(k in summary) {
        if(summary[k] != undefined && summary[k]["visible"] == false) continue;
        v = summary[k];
        slices.push(v["sum"].toFixed(2));
        labels.push(v["title"]);
    }

    charts.forEach(x => {
        x.destroy();
    });

    var ctx = $("#pie_chart");
    charts.push(new Chart(ctx,{
        type: 'pie',
        data: {
            datasets:[{
                data:slices,
                backgroundColor:getCircleColors(labels.length),
                borderWidth:2
            }],            
            labels:labels.map(x => {return x.substring(0,30);})
        },
        options: {
            responsive:true,
            legend: {
                position:'left',
            }
        },
        
    }));
    refreshLines(30);

    $(".checker").change(function() {
        var tar = $(this).attr("tar");
        var checked = $(this).prop("checked");
        console.log(checked);
        if(tar == "all") {
            summary.forEach(x => x["visible"] = checked);
        } else {
            console.log(tar);
            summary[tar]["visible"] = checked;
        }
        getVisual();
    });
}

$(".intervalsetter").click(function() {
    var interval = $(this).attr("interval");
    refreshLines(interval);
});

var lineChart;
var lineChartSum;

function refreshLines(days) {

    filtered = summary.filter(x => x["visible"]);

    start = new Date($("#from").val());
    end = new Date($("#to").val());
    testDate = new Date(end);

    labels = [];
    dates = [];
    while(testDate > start) {
        dates.push(new Date(testDate));
        labels.push(testDate.toISOString("yy-mm-dd").split("T")[0]);
        testDate.setDate(testDate.getDate()-days);   
    }
    dates.push(new Date(start));
    labels.push(start.toISOString("yy-mm-dd").split("T")[0]);


    dates.reverse();
    labels.reverse();
    datasets = [];
    datasets2 = [];
    var cols = getCircleColors(filtered.length);
    indexes = [];
    for(var k in filtered) {
        datasets.push({
            label:filtered[k]["title"],
            data:Array(labels.length).fill(0),
            borderColor:cols[k],
            fill:false
        })

        datasets2.push({
            label:filtered[k]["title"],
            data:Array(labels.length).fill(0),
            borderColor:cols[k],
            fill:false
        })

        indexes[filtered[k]["title"]] = k;
    }

    i = 0;
    summer = Array(cols.length).fill(0);
    for(var k in fileData) {
        var v = fileData[k];
        
        if(!(v["title"] in indexes)) {
            continue;
        }

        if(v["date"] < start) 
            continue;

        if(v["date"] > dates[i]) {          
            i++;
            for(var s in summer) {
                datasets2[s]["data"][i] = summer[s];
            } 
        }

        datasets[indexes[v["title"]]]["data"][i] += v["qty"];
        summer[indexes[v["title"]]] += v["qty"];

        if(k == fileData.length-1) {
            for(var s in summer) {
                datasets2[s]["data"][i] = summer[s];
            }  
        }
    }

    if(lineChart)
        lineChart.destroy();

    var ctx = $("#line_chart");
    lineChart = new Chart(ctx,{
        type: 'line',
        data: {
            datasets:datasets,            
            labels:labels.map(x => {return x.substring(0,30);})
        },
        options: {
            responsive:true,
            legend: {
                display:true
            }
        },
        
    });
    charts.push(lineChart);

    if(lineChartSum)
        lineChartSum.destroy();

    var ctx = $("#line_chart_sum");
    lineChartSum = new Chart(ctx,{
        type: 'line',
        data: {
            datasets:datasets2,            
            labels:labels.map(x => {return x.substring(0,30);})
        },
        options: {
            responsive:true,
            legend: {
                display:true
            }
        },
        
    });
    charts.push(lineChartSum);
}

function getCircleColors(n) {
    cols = [];
    for (var i = 0; i < n; i++) {
        var h = Math.floor((i/n)*360);
        
        cols.push(new Color("hsl(" + h + ",60%,50%)").rgbString()); 
    }
    return cols;
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