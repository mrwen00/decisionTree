var app = angular.module('starter', []);

var initAll = function($scope) {
  $scope.selected = {};
  $scope.predictResult = "Không có";
  $scope.statusResult = {
    showMsg: "Chưa thực hiện",
    hideMsg: "Chưa thực hiện"
  };
}

app.controller('myCtrl', function($scope) {

  $scope.dataset = dataset;
  $scope.listAttribute = dataset.listAttribute;
  initAll($scope);

  console.log("this is angular");
  console.log(JSON.stringify($scope.dataset));

  $scope.findResult = function() {
    var result = predictResultByTree(classifyTree, $scope.selected)
    console.log(result);
    if (result) {
      $scope.predictResult = result.Value;
      $scope.statusResult = {
        showMsg: "Thành công",
        hideMsg: "Không có lỗi"
      };
    }
    else {
      $scope.predictResult = "Không có kết quả";
      $scope.statusResult = {
        showMsg: "Có lỗi",
        hideMsg: "Có lỗi hoặc không tìm thấy. Xem lại câu truy vấn."
      };
    }
      
  }

  $scope.changeSelectedItem = function(key, value) {
    $scope.selected[key] = value;
    console.log('what value is')
    console.log(value)
    console.log($scope.selected);
  }

  $scope.clearAll = function() {
    initAll($scope);
  }

  $scope.myfunction = function (data) {
    console.log('can go myfunction')
    console.log(JSON.stringify(data.listAttribute))
    $scope.dataset = data;
    $scope.listAttribute = data.listAttribute;
    $scope.$apply();
  };
})
