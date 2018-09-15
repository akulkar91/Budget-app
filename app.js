 //BUDGET CONTROLLER
 var budgetController = (function(){

     var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
     };

     var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
     };

     var calculateTotal = function(type){
          var sum=0;
          data.allItems[type].forEach(function(cur_ele){
              sum += cur_ele.value;
          });
          data.totals[type] = sum;
     };

     var data = {
          allItems: {
            exp:[],
            inc:[]
                    },
          totals: {
            exp:0,
            inc:0
          },
          budget: 0,
          percentage: -1
        };

        return {
            addItem: function(type,des,val){
              var newItem, ID;
              //[1 2 3 4 5 ] next ID should be 6
              //the above isn't good enough becaus we might delete some records
              //[1 2 4 5 7 8] next ID should be 9
              // ID = lastID + 1

              //create new ID
              if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;//find the last id and add 1
              } else {
                ID = 0;
              }

              //Create new item based on 'Inc' or 'Exp'
              if (type ==='exp') {
                 newItem = new Expense(ID,des,val);
              } else if (type === 'inc') {
                 newItem = new Income(ID,des,val);
              }

              // Push values to the data structure
              data.allItems[type].push(newItem);

              // Return the new element
              return newItem;
            },

            calculateBudget: function(){

                  //1.Calculate total income and expenses
                  calculateTotal('exp');
                  calculateTotal('inc');

                  //2.Calculate the budget : income - expenses
                  data.budget = data.totals.inc - data.totals.exp;

                  //3.calculate the percentage of income that we spent
                  if (data.totals.inc > 0 && data.totals.inc > data.totals.exp ) {
                      data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
                  } else{
                    data.percentage = -1;
                  }

            },

            getBudget: function(){

                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            },

            testing: function() {
              console.log(data);
            }


        };
















   /*var x = 23;
        //to demonstrate benifits of closures

        var add = function(a) {
              return x + a;
        }

        //this function will return the following function
        return {
          //this will be the function whihc we can call outside of this iife function as this has been nade public
          publicTest: function(b){
            return add(b);
          }
        }*/
 })();

 //UI CONTROLLER
 var UIController = (function(){

      var DOMStrings = {
              inputType: '.add__type',
              inputDescription: '.add__description',
              inputValue: '.add__value',
              inputBtn: '.add__btn',
              incomeContainer: '.income__list',
              expensesContainer: '.expenses__list',
              budgetLabel: '.budget__value',
              incomeLabel: '.budget__income--value',
              expensesLabel: '.budget__expenses--value',
              percentageLabel: '.budget__expenses--percentage',
              container: '.container'
      };

      return {
          getInput: function(){
              return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
              };

        },

        addListItem: function(obj, type){
              var html, newHtml ,element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
              element = DOMStrings.incomeContainer;

              html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
              element = DOMStrings.expensesContainer;

              html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function(){
          var fields, fieldsArr;

          // querySelectorAll method retuns LISTS instead of an Array
          fields = document.querySelectorAll(DOMStrings.inputDescription + ','+ DOMStrings.inputValue);
          // convert this list to an Array
          fieldsArr = Array.prototype.slice.call(fields);
          //fieldsArr is an array now

          //clearing fields using forEach loop
          fieldsArr.forEach(function(cur,ind,arr){
            cur.value = "";
          });
          fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = "+ " + obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent ="- " + obj.totalExp;
            if (obj.percentage >0) {
              document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
              document.querySelector(DOMStrings.percentageLabel).textContent = "--";
            }
        },
        getDOMStrings: function(){
          return DOMStrings;
            }
        };

 })();

 //GLOBAL APP CONTROLLER
 var controller = (function(budgetCtrl,UIctrl){

      var setupEventListeners = function(){
      var DOM = UIctrl.getDOMStrings();

          document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);



          document.addEventListener('keypress',function(event){
              if (event.keyCode === 13 || event.which === 13) {
                  ctrlAddItem();
                  }
          });

          document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };


   var updateBudget = function(){

        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UIctrl.displayBudget(budget);
   };
   var ctrlAddItem = function() {

     var input, newItem;
     //1. Get the field input data
     input = UIctrl.getInput();

     if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
       //2.Add the item to the budgetController
       newItem = budgetCtrl.addItem(input.type , input.description, input.value);
       //3. Add the item to the UI
       UIctrl.addListItem(newItem, input.type);
       //4. Clear fields
       UIctrl.clearFields();
       //4. Calculate the budget
       updateBudget();
       //5. Display the budget on the UI

     }

   };

   var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentnode.parentnode.parentnode.parentnode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

          //1. Delete the item from the data structure

          //2. Delete the item from the UI

          //3. Updare and show the new budget

        }
   };


   return {
      init: function(){
        console.log('Application has started');
        UIctrl.displayBudget({
          budget: 0,
          totalInc:0 ,
          totalExp: 0,
          percentage:-1
      });
        setupEventListeners();
      }
   };


   /*var z = budgetController.publicTest(5);
   console.log(z);*/
 })(budgetController,UIController);

 controller.init();


















//