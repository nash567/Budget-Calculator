//BUDGET CONTROLLER

var budjetController = (function() {
	var Expenses = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expenses.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};
	Expenses.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allitems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},

		budget: 0,
		percentage: -1 // to just show doesnot exist
	};
	var calculateTotal = function(type) {
		var sum = 0;
		data.allitems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.total[type] = sum;
	};

	return {
		addItem: function(type, des, val) {
			var newItem;

			//[1 2 3 4 5 ] next id = 6

			//[1 2 3 6 8] next id = 9

			//ID = last ID + 1

			// create new id

			if (data.allitems[type].length > 0) {
				ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			//create new Object based on type

			if (type == 'exp') {
				newItem = new Expenses(ID, des, val);
			} else if (type == 'inc') {
				newItem = new Expenses(ID, des, val);
			}

			//Push the newObj into data

			data.allitems[type].push(newItem);

			//return that object

			return newItem;
		},
		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allitems[type].map(function(cur) {
				return cur.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allitems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			// calculate total incom and expenses

			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget income-expenses

			data.budget = data.total.inc - data.total.exp;

			//calculate the % of income we spent

			if (data.total.inc > 0) {
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
			} else {
				data.percentage = -1;
			}

			// eg exp =100 and inc =100 so % = 50
		},
		calcPercentages: function() {
			data.allitems.exp.forEach(function(cur) {
				cur.calcPercentage(data.total.inc);
			});
		},
		getPercentages: function() {
			var allPerc = data.allitems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.total.inc,
				totalExp: data.total.exp,
				percentage: data.percentage
			};
		},
		testing: function() {
			console.log(data);
		}
	};
})();

//////////////////////////////////////////////////////////////////////////////

/////////////UI CONTROLLER

var UIController = (function() {
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',

		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',

		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		// + or - before the nmber
		// exactly2 decimal points
		// comma seprating the numbers
		// 2310.46 ->2,310.46
		// 2000 ->2,000.00
		var numSplit, int, dec, type;

		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');

		int = numSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getinput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //////will be either inc or exp

				description: document.querySelector(DOMstrings.inputDescription).value,

				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element;

			//Create Html string with Place holder text

			if (type == 'inc') {
				element = DOMstrings.incomeContainer;

				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type == 'exp') {
				element = DOMstrings.expenseContainer;

				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//Relace    the placeholder text with some values

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			//Insert the HTML into dom

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);

			el.parentNode.removeChild(el);
		},
		clearfields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(
				DOMstrings.inputDescription + ',' + DOMstrings.inputValue
			);
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(cur, i, arr) {
				cur.value = '';
			});

			fieldsArr[0].focus();
		},

		displayBudget: function(obj) {
			var type;

			obj.budget > 0 ? (type = 'inc ') : (type = 'exp');
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
				obj.budget,
				type
			);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
				obj.totalInc,
				'inc'
			);
			document.querySelector(
				DOMstrings.expensesLabel
			).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent =
					obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '--';
				}
			});
		},

		displayMonth: function() {
			var months, year, month, now;
			now = new Date();

			months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'Seeptember',
				'October',
				'November',
				'December'
			];
			month = now.getMonth();

			year = now.getFullYear();

			document.querySelector(DOMstrings.dateLabel).textContent =
				months[month] + ' ' + year;

			// var christmas = new Date(2016,11,25)   this will return a date obj called christmas
		},
		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType +
					',' +
					DOMstrings.inputDescription +
					',' +
					DOMstrings.inputValue
			);

			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	};
})();

////////GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UICtrl) {
	var setupEventListners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
		document
			.querySelector(DOM.container)
			.addEventListener('click', ctrlDeleteitem);

		document
			.querySelector(DOM.inputType)
			.addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {
		// 1 Calculate the budet

		budgetCtrl.calculateBudget();

		//2 return the Budget

		var budget = budgetCtrl.getBudget();

		//3 Display the  budget on UI

		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		//calculate the %

		budgetCtrl.calcPercentages();

		// read them from budget ctrl

		var percentages = budgetCtrl.getPercentages();

		// update the user interface with new percentages

		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;

		//1. get the field input data

		input = UICtrl.getinput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			//2.Add item to budjet controller

			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3.Addd the item to the Ui

			UICtrl.addListItem(newItem, input.type);

			// clear the fields

			UICtrl.clearfields();

			// calculate and update budget

			updateBudget();

			// calculate and update percentages

			updatePercentages();
		}
	};

	var ctrlDeleteitem = function(event) {
		var itemId, splitId, type;
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0];
			ID = parseInt(splitId[1]);

			// 1. delete the item from data structure

			budgetCtrl.deleteItem(type, ID);

			//2.delete the item from ui

			UICtrl.deleteListItem(itemId);

			//3.update and show the new Object

			updateBudget();

			// calculate and update percentages

			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log('application started');
			UICtrl.displayMonth();
			setupEventListners();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
		}
	};
})(budjetController, UIController);

controller.init();

console.log(
	document.querySelectorAll('.add__description' + ',' + '.add__value').values
);
