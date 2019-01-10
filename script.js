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
            if(row["title"] in data) {
                data[row["title"]]["list"].push(row);
                data[row["title"]]["qty"] += row["qty"];
                data[row["title"]]["sum"] += row["sum"];
            } else {
                data[row["title"]] = {
                    "title":row["title"],
                    "qty":row["qty"],
                    "sum":row["sum"],
                    "list":[row]
                };
            }
            
            t += 
            "<tr>" + 
            v.split(",")
                .map(x => {return "<td>" + x.slice(1,-1) + "</td>";})
                .join("")
            + "</tr>";
        });
        $("#list").html(t);

        t = "";
        // console.log(data);
        for(k in data)
        {
            v = data[k];
            t += "<tr>" +
            "<td>" + v["title"]  + "</td>" +
            "<td>" + v["qty"]  + "</td>" +
            "<td>" + v["sum"]  + "</td>" +
            "</tr>";
        }
        $("#sumlist").html(t);
    };
    reader.readAsText($("#file").prop("files")[0]);
});