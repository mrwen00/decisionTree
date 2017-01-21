// calculate by entropy

var entropyOneAttr = function(list, attr) {
  var sum = list.length;
  var result = 0;

  attr.Values.forEach(function(value) {
    var freq = list.reduce(function(sum, item) {
      if (item[attr.Name] == value)
        return sum + 1;
      else
        return sum;
    }, 0);
    var p = freq / sum;
    var temp = p

    if (p != 0) {  // the attribute does not exist in list
      result = result - p * Math.log2(p);    
    }

  })

  return result;
}

var entropyTwoAttr = function(list, attrGoal, attrElem) {
  var sum = list.length;
  var listEntropy = [];
  var result = 0;
  attrElem.Values.forEach(function(value) {
    var filterList = list.filter(function(item) {
      return item[attrElem.Name] == value
    })
    var lengthFilterList = filterList.length;
    var pValue = lengthFilterList / sum;
    var entropy = entropyOneAttr(filterList, attrGoal);

    if (! isNaN(entropy))
      result = result + pValue * entropy;    

    listEntropy.push({
      value: value,
      entropy: entropy
    })

  })

  return {
    value: result,
    listEntropy: listEntropy
  }

}

var handleClassifyTree = function(list, listAttribute, goalAttr) {
  var entropyGoal = entropyOneAttr(list, goalAttr);
  var max = 0;
  var chooseAttr = {};
  var entropy;
  var entropyValue;
  var temp;

  console.log("what happen and listAttribute")  
  console.log(JSON.stringify(listAttribute))  
  listAttribute.forEach(function(item) {
    entropy = entropyTwoAttr(list, goalAttr, item);    
    entropyValue =  entropy.value;
    var gain = entropyGoal - entropyValue;
    console.log("can go here")
    temp = item
    if (gain > max) {
      max = gain;
      chooseAttr = {
        Name: item.Name,
        listEntropy: entropy.listEntropy
      }
    }

  })


  if (max == 0) {
    console.log("when max = 0 and what temp")
    console.log(JSON.stringify(temp))
    chooseAttr = {
      Name: temp.Name,
      listEntropy: entropy.listEntropy
    }
  }

  console.log("what is choose attr");
  console.log(JSON.stringify(chooseAttr));

  return chooseAttr;
}

var delteElementByName = function(arr, deleteValue) {  // remove element in listAttribute base on Name
  arr.forEach(function(item, index) {
    if (item.Name == deleteValue) {
      arr.splice(index, 1);
      return;
    }      
  })
  return arr;
}

var classifyRecursive = function(list, listAttribute, goalAttr) {

  if (list.length == 0) {
    console.log("List empty, can not recursive");
    return null;
  }

  var classifyTree = handleClassifyTree(list, listAttribute, goalAttr);
  var rootAttr = classifyTree.Name;
  var result = [];

  classifyTree.listEntropy.forEach(function(item, index) {

    var value = item.value;
    var entropy = item.entropy;

    if (!! entropy ) {   // if not null
      var filterList = list.filter(function(item) {
        return item[rootAttr] == value
      })

      listAttribute = delteElementByName(listAttribute, rootAttr);
      
      classifyTree.listEntropy[index].child = classifyRecursive(filterList, listAttribute, goalAttr);
      result = classifyTree.listEntropy[index].child;

    }
    else {

      list.forEach(function(item) {
        if (item[rootAttr] == value) {
          classifyTree.listEntropy[index].finalResult = {
            Name: goalAttr.Name,
            Value: item[goalAttr.Name]
          }
        }
      })

    }
  })

  return classifyTree;
}

var predictResultByTree = function(classifyTree, object) {

  var rootAttr = classifyTree.Name;
  var valueObj = object[rootAttr];
  var result;

  classifyTree.listEntropy.forEach(function(item) {

    if (valueObj == item.value) {  // find out value
      if (typeof item.child != "undefined") {
        result = predictResultByTree(item.child, object);
      }
      else {  // finalResult exists
        result = item.finalResult;
      }
      return;
    }
  })

  return result;

}

var formatToPush = function(key, parent, name, color) {
  return {
    key: key,
    parent: parent,
    name: name,
    color: color
  }
}

var parseTreeIntoList = function(classifyTree, listKey, result, parent=0) {  // parse classify tree into list, no child
  var rootAttr = classifyTree.Name;
  var getKey = listKey.shift();   // get new key in listKey

  result.push(formatToPush(getKey, parent, rootAttr, "blue"))

  classifyTree.listEntropy.forEach(function(item) {

    parent = getKey;
    key = listKey.shift();

    result.push(formatToPush(key, parent, item.value, "blue"));

    if (typeof item.child != "undefined") {
      parseTreeIntoList(item.child, listKey, result, key);

    }
    else {
      parent = key;
      key = listKey.shift();

      if (item.finalResult)
        result.push(formatToPush(key, parent, item.finalResult.Value, "pink"));
      else
        result.push(formatToPush(key, parent, "Unknown", "pink"));   
    }
  })
}

var parseIntoJSON = function(rawList, fieldList) {
  return rawList.map(function(item) {  // parse from rawList into JSON list
    var object = {}
    fieldList.forEach(function(name, index) {
      object[name] = item[index]
    })
    return object;
  })
}

var testSet = {
  test1: {
    rawList: [
      ["Rainy", "Hot", "High", "False", "No"],
      ["Rainy", "Hot", "High", "True", "No"],
      ["Overcast", "Hot", "High", "False", "Yes"],
      ["Sunny", "Mild", "High", "False", "Yes"],
      ["Sunny", "Cool", "Normal", "False", "Yes"],
      ["Sunny", "Cool", "Normal", "True", "No"],
      ["Overcast", "Cool", "Normal", "True", "Yes"],
      ["Rainy", "Mild", "High", "False", "No"],
      ["Rainy", "Cool", "Normal", "False", "Yes"],
      ["Sunny", "Mild", "Normal", "False", "Yes"],
      ["Rainy", "Mild", "Normal", "True", "Yes"],
      ["Overcast", "Mild", "High", "True", "Yes"],
      ["Overcast", "Hot", "Normal", "False", "Yes"],
      ["Sunny", "Mild", "High", "True", "No"],
    ],
    field: ["Outlook", "Temp", "Humidity", "Windy", "PlayGolf"],
    listAttribute: [
      {
        Name: "Outlook",
        Values: ["Sunny", "Overcast", "Rainy"]
      },
      {
        Name: "Temp",
        Values: ["Hot", "Mild", "Cool"],
      },
      {
        Name: "Humidity",
        Values: ["High", "Normal"],
      },
      {
        Name: "Windy",
        Values: ["True", "False"]
      },
    ],
    goalAttr: {
      Name: "PlayGolf",
      Values: ["Yes", "No"]
    },    
  },
  test2: {
    rawList: [
      ["Sarah", "Yellow", "Medium", "Light", "Not Use", "Yes"],
      ["Dana", "Yellow", "Tall", "Medium", "Use", "No"],
      ["Alex", "Brown", "Short", "Medium", "Use", "No"],
      ["Annie", "Yellow", "Short", "Medium", "Not Use", "Yes"],
      ["Emilie", "Red", "Medium", "Heavy", "Not Use", "Yes"],
      ["Peter", "Brown", "Tall", "Heavy", "Not Use", "No"],
      ["John", "Brown", "Medium", "Heavy", "Not Use", "No"],
      ["Kartie", "Yellow", "Short", "Light", "Use", "No"]
    ],
    field: ["Name", "Hair", "Height", "Weight", "Cream", "Liked"],
    listAttribute: [
      {
        Name: "Hair",
        Values: ["Yellow", "Brown", "Red"]
      },
      {
        Name: "Height",
        Values: ["Tall", "Medium", "Short"],
      },
      {
        Name: "Weight",
        Values: ["Heavy", "Medium", "Light"],
      },
      {
        Name: "Cream",
        Values: ["Use", "Not Use"]
      }
    ],
    goalAttr: {
      Name: "Liked",
      Values: ["Yes", "No"]
    },
    parseIntoJSON: function(list) {
      return list.map(function(item) {
        return {
          Hair: item[0],
          Height: item[1],    
          Weight: item[2],
          Cream: item[3],
          Liked: item[4],
        }
      })
    }
  },
  test3: {
    rawList: [
      ["Male", "0", "Cheap", "Low", "Bus"],
      ["Male", "1", "Cheap", "Medium", "Bus"],
      ["Female", "1", "Cheap", "Medium", "Train"],
      ["Female", "0", "Cheap", "Low", "Bus"],
      ["Male", "1", "Cheap", "Medium", "Bus"],
      ["Male", "0", "Standard", "Medium", "Train"],
      ["Female", "1", "Standard", "Medium", "Train"],
      ["Female", "1", "Expensive", "High", "Car"],
      ["Male", "2", "Expensive", "Medium", "Car"],
      ["Female", "2", "Expensive", "High", "Car"],
    ],
    field: ["Gender", "CarOwner", "TravelCost", "Income", "Transportation"],
    listAttribute: [
      {
        Name: "Gender",
        Values: ["Male", "Female"]
      },
      {
        Name: "CarOwner",
        Values: ["0", "1", "2"]
      },
      {
        Name: "TravelCost",
        Values: ["Cheap", "Standard", "Expensive"]
      },
      {
        Name: "Income",
        Values: ["Low", "Medium", "High"]
      },
    ],
    goalAttr: {
      Name: "Transportation",
      Values: ["Bus", "Train", "Car"]
    },
  },
  test4: {
    rawList: [
      ["<=30", "High", "No", "Fair", "No"],
      ["<=30", "High", "No", "Excellent", "No"],
      ["31..40", "High", "No", "Fair", "Yes"],
      [">40", "Medium", "No", "Fair", "Yes"],
      [">40", "Low", "Yes", "Fair", "Yes"],
      [">40", "Low", "Yes", "Excellent", "No"],
      ["31..40", "Low", "Yes", "Excellent", "Yes"],
      ["<=30", "Medium", "No", "Fair", "No"],
      ["<=30", "Low", "Yes", "Fair", "Yes"],
      [">40", "Medium", "Yes", "Fair", "Yes"],
      ["<=30", "Medium", "Yes", "Excellent", "Yes"],
      ["31..40", "Medium", "No", "Excellent", "Yes"],
      ["31..40", "High", "Yes", "Fair", "Yes"],
      [">40", "Medium", "No", "Excellent", "No"],
    ],
    field: ["Age", "Income", "Student", "Credit", "Buys"],
    listAttribute: [
      {
        Name: "Age",
        Values: ["<=30", "31..40", ">40"]
      },
      {
        Name: "Income",
        Values: ["Low", "Medium", "High"]
      },
      {
        Name: "Student",
        Values: ["Yes", "No"]
      },
      {
        Name: "Credit",
        Values: ["Fair", "Excellent"]
      },
    ],
    goalAttr: {
      Name: "Buys",
      Values: ["Yes", "No"]
    },
  }
}


var processing = function(test) {
  var rawList = parseIntoJSON(test.rawList, test.field)
  console.log(JSON.stringify(rawList));
  classifyTree = classifyRecursive(rawList, test.listAttribute, test.goalAttr);
  var listKey = Array.apply(null, {length: 1000}).map(Number.call, Number)
  var parseTree = [];
  parseTreeIntoList(classifyTree, listKey, parseTree);
  console.log("parse tree");
  console.log(JSON.stringify(parseTree));
  return parseTree;
}


dataset = testSet.test1;
var copy = JSON.parse(JSON.stringify(dataset))
parseTree = processing(copy)


