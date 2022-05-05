const Discord = require('discord.js');
const Sequelize = require('sequelize');
const client = new Discord.Client();
const PREFIX = '!';
var predicting = require('./predictions');


//Sequilize Table building

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const { Op } = require('sequelize')

const theMarket = sequelize.define('shop', {
	username: Sequelize.STRING,
	item: Sequelize.TEXT,
	buysell: Sequelize.STRING,
	price: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

const hotItems = sequelize.define('hotitems', {
	username: Sequelize.STRING,
	item: Sequelize.TEXT,
	month: {
		type: Sequelize.STRING,
		defaultValue: "January",
		allowNull: false,
	},
	day: {
		type: Sequelize.INTEGER,
		defaultValue: 1,
		allowNull: false,
	},
	price: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
});

const Stonks = sequelize.define('stonks', {
	username: Sequelize.STRING,

	month: {
		type: Sequelize.STRING,
		defaultValue: "January",
		allowNull: false,
	},
	day: {
		type: Sequelize.INTEGER,
		defaultValue: 1,
		allowNull: false,
	},
	price: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	buyprice: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	dayofweek: {
		type: Sequelize.INTEGER,
		defaultValue: 1,
	},
	AMPM: {
		type: Sequelize.STRING,
	},
	lastPattern: {
		type: Sequelize.STRING,
	},
});

client.once('ready', () => {
	theMarket.sync();
	hotItems.sync();
	Stonks.sync();
});


client.on('message', async message => {
	
	//stops if the message is from a BOT
	if (message.author.bot) return;	
	
	//checks if the message is a command and ignores it if it doesnt start with !
	if (!message.content.startsWith('!')) return;
	
	//takes out the !
	const withoutPrefix = message.content.slice(1);
	//splits the message at every space
	const split = withoutPrefix.split(/ +/);
	// puts the first "word" before the space into constant variable "command"
	const command = (split[0]).toString().toLowerCase();
	//the rest of the arguements are stored in args starting at args[0]
	const args = split.slice(1);	
	
	if (command === 'help' || command === 'ht') {
		if (!args[0] && command !== 'ht'){	
		message.channel.send('| !Ping | !NewHorizons | !Hype | !Poe2 | !Echo message |  !Help Trade | !AddTrade | !GetTrade | !DeleteTrade |\n| All 2 word commands can be shortened to the first letter of each word try !NH');
		return;
		}
		
		if (args[0] === "trade" || args[0] === "Trade" || command === 'ht'){
		message.channel.send("!addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)\n!GetTrades for all trade offers !GetTrades @user for all of a certain users offers\n!DeleteTrade (name of item being traded) !DeleteTrade all This will delete all your trades");
		return;
		}
		
		args[0]= args[0].toString().toLowerCase();
		if (args[0] === "gettrade" || args[0] === "gt"|| args[0] === "gettrades"){
		message.channel.send("!gt or !GetTrade or !GetTrades\n!GetTrades will return all trades\n!GetTrades @user will get all of a users trade offers\n!GetTrades Number will return all trade offers less than or equal to the number given");
		return;
		}
		
		message.channel.send('| !Ping | !NewHorizons | !Hype | !Poe2 | !Echo message |  !Help Trade | !AddTrade | !GetTrade | !DeleteTrade |');
		return;
	}
	
	if (command === 'hype') {		
		message.channel.send('Hype! Hype! Hype! Hype! Hype! Hype! Hype!');
		return;
	}
	
	
	if (command === 'stonks' || command === 'sm' || command === 'stalks' || command === 'stonk' || command === 'predict' || command === 'stinks' || command === 'stink') {
		var d = new Date();
		var month = new Array();
		month[0] = "January";
		month[1] = "February";
		month[2] = "March";
		month[3] = "April";
		month[4] = "May";
		month[5] = "June";
		month[6] = "July";
		month[7] = "August";
		month[8] = "September";
		month[9] = "October";
		month[10] = "November";
		month[11] = "December";	
		var weekDay = d.getDay();
		var theDay = new Array();
		theDay[0] = "Sunday";
		theDay[1] = "Monday";
		theDay[2] = "Tuesday";
		theDay[3] = "Wednesday";
		theDay[4] = "Thursday";
		theDay[5] = "Friday";
		theDay[6] = "Saturday";
		
		if(command === 'predict'){
			args.unshift("placeholder");
		}
				
		try{			
			//the command is just !stonks so we return the 12 most recent prices across all users
			if(!args[0]){		
				var whatUser = message.author.username;
				if (getLastSunday() > d.getDate()){
					var x = new Date();
					x.setDate(0);
					const lastHalfprices = await Stonks.findAll({order: [ [ 'createdAt', 'ASC' ]] ,where: {[Op.and]: [ {day: {[Op.between]: [1, parseInt(d.getDate())]}}, {username: whatUser}, {month: month[d.getMonth()]}]}});
					const firstHalfprices = await Stonks.findAll({order: [ [ 'createdAt', 'ASC' ]] ,where: {[Op.and]: [ {day: {[Op.between]: [parseInt(getLastSunday()), parseInt(x.getDate())]}}, {username: whatUser}, {month: getLastSundayMonth()}]}});
					console.log("all prices");
					console.log(lastHalfprices);
					allPrice = firstHalfprices.concat(lastHalfprices);
					console.log(allPrice);
					
					
				}else{
					allPrice = await Stonks.findAll({order: [ [ 'createdAt', 'ASC' ]] ,where: {[Op.and]: [ {day: {[Op.between]: [parseInt(getLastSunday()), parseInt(d.getDate())]}}, {month: getLastSundayMonth()}]}});	
				}
				if(allPrice === undefined || allPrice.length == 0){
						return message.reply("No prices found this week.");
				}
				var i;
				const sortedPrices = dateSorter(allPrice);
				console.log(sortedPrices.length);

				var builtMessage = `Last ${sortedPrices.length} prices are:`;

				for(i = 0; i < sortedPrices.length; i++){
					if(sortedPrices[i].day === getLastSunday()){
						builtMessage = builtMessage + `\n${sortedPrices[i].username} bought turnips on ${sortedPrices[i].month} ${sortedPrices[i].day} for ${sortedPrices[i].price} bells.`
					}else{
						builtMessage = builtMessage + `\n${sortedPrices[i].username} turnip price on ${sortedPrices[i].month} ${sortedPrices[i].day} in the ${sortedPrices[i].AMPM} was ${sortedPrices[i].price} bells.`
					}
				}
				
				return message.channel.send(builtMessage, { code: true });
				
			//the command is !stonks [price] this will add there stalk price to the database for today
			} else if(!isNaN(args[0])){	
			
				var timeOfPrice;				
					if(args[1]){
						if (args[1].toString().toUpperCase() === "AM"){
							timeOfPrice = "AM";
						}else if(args[1].toString().toUpperCase() === "PM"){
							timeOfPrice = "PM";
						}else{
							timeOfPrice = getAMPM(message.author.username);
							message.reply("Could not determine AM or PM from your message. I am setting your time based off of your current time which is " + timeOfPrice + ".");
						}
					}else{
						timeOfPrice = getAMPM(message.author.username);
						/*
						if (weekDay !== 0){
							message.reply("Setting time to " + timeOfPrice + " based off of message time.");
						}*/
					}
			
				//checks if the messager already has a price today there may be a findorcreate with sequelize to simplify this in the future
				const todayPrice = await Stonks.findOne({where: {[Op.and]: [ {day: d.getDate()}, {AMPM: timeOfPrice}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
			
				if(todayPrice){
					return message.reply("You have already entered a price today in the " + timeOfPrice + " for " + todayPrice.price + " bells. To update it try \"!stonk update [new price] [AM or PM]\"");
				}
				//this will be used to save this weeks buy price if it is findable
				var setBuyPrice = 0;
				//we know args[0] is a number so this parses it into an easy to remember variable
				itemPrice = parseInt(args[0]);
				
				//if its sunday we set the buy price to todays price
				if (weekDay === 0){
					setBuyPrice = itemPrice;
				}
					
				//finds the last sundays entry using the getLastSunday function to handle awkward month and year date issues
				const sundayPrice = await Stonks.findOne({where: {[Op.and]: [ {day: getLastSunday()}, {username: message.author.username}, {month: getLastSundayMonth()}]}});
				
				if(!sundayPrice){
					if (weekDay !== 0){
						message.reply("Could not find the price you bought at this week. To enter your buying price type \"!stonks buy [price]\"");
					}
				}else{					
					setBuyPrice = sundayPrice.price;
				}
				
				//creates an entry with all the data we got buy is 0 unless we found a price or set it
				const anotherPrice = await Stonks.create({
					month: month[d.getMonth()],
					day: d.getDate(),
					username: message.author.username,
					price: itemPrice,
					dayofweek: weekDay,
					buy:setBuyPrice,
					AMPM:timeOfPrice,
				});
				
				//word formatting if turnips were bought or its a days price
				if(weekDay === 0){
					return message.reply(message.author.username + " bought turnips today " + month[d.getMonth()] + " " + d.getDate() + " for " + itemPrice + " bells.");
				}
				return message.reply(message.author.username + "'s Turnip price Today " + month[d.getMonth()] + " " + d.getDate() + " in the " + timeOfPrice + " is " + itemPrice + " bells.");
			
			}else if(args[0].toString().toLowerCase() === "update" || args[0].toString().toLowerCase() === "updateitem"){	
			
				if(!args[1]){
					return message.reply("No price was entered please use \"!stonk update [new price] [AM or PM]\"");
				}
			
				if(isNaN(args[1])){
					return message.reply("No number was found use \"!stonk update [new price] [AM or PM]\"");
				}
			
				if(weekDay === 0){
					const todayPrice = await Stonks.update({buyprice: args[1]},{where: {[Op.and]: [ {day: d.getDate()}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
					
					if(!todayPrice){
						return message.reply("You have not entered turnip prices today");
					}
					
					return message.reply("Your buying price for turnips today is now " + args[1] + " bells.");;
				}
				var timeOfPrice;
				if(!args[2]){
					timeOfPrice = getAMPM(message.author.username);
				}else{
					if (args[1].toString().toUpperCase() === "AM"){
						timeOfPrice = "AM";
					}else if(args[1].toString().toUpperCase() === "PM"){
						timeOfPrice = "PM";
					}else{
						timeOfPrice = getAMPM(message.author.username);
						message.reply("Could not determine AM or PM from your message setting your time based off of current time or " + timeOfPrice + ".");
					}
				}
		
				const todayPrice = await Stonks.update({price: args[1]},{where: {[Op.and]: [ {day: d.getDate()}, {AMPM: timeOfPrice}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
		
				if(!todayPrice){
					return message.reply("You have not entered turnip prices today for the " + timeOfPrice + " Try \"!stonks [new price] [AM or PM]\" to change the time for day or night.");
				}
			
				return message.reply("Your turnip price for today in the " + timeOfPrice + " is now " + args[1] + " bells.");;
			
			}else if(args[0].toString().toLowerCase() === "clear" || args[0].toString().toLowerCase() === "delete"){
				
				if(!args[1]){
					const rowCount = await Stonks.destroy({ where:  {[Op.and]: [ {day: d.getDate()}, {username: message.author.username}]}});
					if(!rowCount){
						return message.reply("No prices today to delete");
					}
					return message.reply("Todays prices have been deleted");
				}
				
				if(args[1].toString().toLowerCase() === "am"){
					const rowCount = await Stonks.destroy({ where:  {[Op.and]: [ {day: d.getDate()}, {AMPM: "AM"}, {username: message.author.username}]}});
					if(!rowCount){
							return message.reply("No prices to delete");
					}
					return message.reply("Todays AM price has been deleted.");
				}
				
				if(args[1].toString().toLowerCase() === "pm"){
					const rowCount = await Stonks.destroy({ where:  {[Op.and]: [ {day: d.getDate()}, {AMPM: "PM"}, {username: message.author.username}]}});
					if(!rowCount){
							return message.reply("No prices to delete");
					}
					return message.reply("Todays PM price has been deleted.");
				}
				
				if(args[1].toString().toLowerCase() === "all"){
					const rowCount = await Stonks.destroy({ where: { username: message.author.username } });
					if(!rowCount){
							return message.reply("No prices to delete");
					}
					return message.reply("All of " +  message.author.username + "'s items have been deleted");
				}
				return message.reply("No price to delete");
				
			}else if(args[0].toString().toLowerCase() === "buy" || args[0].toString().toLowerCase() === "bought"){
				
				if(!args[1]){
					return message.reply("No price was entered please use \"!stonk buy [new price]\" to change or add your sunday buy price");
				}
			
				if(isNaN(args[1])){
					return message.reply("No number was found use \"!stonk buy [new price]\" to change or add your sunday buy price");
				}
				
				var itemPrice = parseInt(args[1]);
				
				if(weekDay === 0){
					const todayPrice = await Stonks.update({buyprice: itemPrice},{where: {[Op.and]: [ {day: d.getDate()}, {username: message.author.username}, {month: month[D.getMonth()]}]}});
					
					if(!todayPrice){
						return message.reply("You have not entered turnip prices today");
					}
					
					return message.reply("Your buying price for turnips today is now " + args[1] + " bells.");;
				}
				const todayPrice = await Stonks.findOne({where: {[Op.and]: [ {day: getLastSunday()}, {username: message.author.username}, {month: getLastSundayMonth()}]}});				
				
				if(!todayPrice){
					const anotherPrice = await Stonks.create({
					month: getLastSundayMonth(),
					day: getLastSunday(),
					username: message.author.username,
					price: itemPrice,
					dayofweek: 0,
					buy:itemPrice,
					AMPM:"PM",
				});
				}else{
					const todayPrice = await Stonks.Update({buyprice: itemPrice},{where: {[Op.and]: [ {day: getLastSunday()}, {username: message.author.username}, {month: getLastSundayMonth()}]}});
				}
				
				return message.channel.send(message.author.username + " bought turnips on " + getLastSundayMonth() + " " + getLastSunday() + " for " + itemPrice + " bells.");
			
			}else if(args[0].toString().toLowerCase() === "predict" || args[0].toString().toLowerCase() === "future" || args[0].toString().toLowerCase() === "prediction" || args[0].toString().toLowerCase() === "predictions" || args[0].toString().toLowerCase() === "p" || command === 'predict'){
				var givenPattern;
				var whatPatterntoUse = -1;
				var whatUser = message.author.username;
				if (!args[1]){
					const checkPattern = await Stonks.findOne({where: {[Op.and]: [ {day: getLastSunday()}, {username: message.author.username}, {month: getLastSundayMonth()}]}});
					if(checkPattern){
						if(checkPattern.lastPattern !== undefined){
							givenPattern = checkPattern.lastPattern;
							console.log(givenPattern);
						}
					}
				} else if(args[2]){
					if (args[2].toLowerCase() === "spike"){
						args[1].toLowerCase();
						args[2].toLowerCase();
						givenPattern = args[1].charAt(0).toUpperCase() + args[1].slice(1) + " " + args[2]
						
						if (getUserFromMention(args[3]) != null){
							const user = getUserFromMention(args[3]);
							whatUser = user.username;
						}
					}else if(getUserFromMention(args[2]) != null){
						args[1].toLowerCase();
						givenPattern =  givenPattern = args[1].charAt(0).toUpperCase() + args[1].slice(1);
						const user = getUserFromMention(args[2]);
						whatUser = user.username;
					}
						
				}else{
					args[1].toLowerCase();
					givenPattern =  givenPattern = args[1].charAt(0).toUpperCase() + args[1].slice(1)
				}
				if (args[1]){
					if(getUserFromMention(args[1]) != null){
						const user = getUserFromMention(args[1]);
						whatUser = user.username;
						const checkPattern = await Stonks.findOne({where: {[Op.and]: [ {day: getLastSunday()}, {username: message.author.username}, {month: getLastSundayMonth()}]}});
						if(checkPattern){
							if(checkPattern.lastPattern !== undefined){
								givenPattern = checkPattern.lastPattern;
								console.log(givenPattern);
							}
						}
					}
				}
				switch(givenPattern){
					case"Fluctuating":
						whatPatterntoUse = 0;
						break;
					case"F":
						whatPatterntoUse = 0;
						break;
					case"Small spike":
						whatPatterntoUse = 3;
						break;
					case"Ss":
						whatPatterntoUse = 3;
						break;
					case"Large spike":
						whatPatterntoUse = 1;
					break;
					case"Ls":
						whatPatterntoUse = 1;
						break;
					case"Decreasing":
						whatPatterntoUse = 2;
						break;
					case"D":
						whatPatterntoUse = 2;
						break;
					default:
					if(args[1]){
						if (whatUser === message.author.username){
							message.reply("Unable to determine your previous pattern.\nThe patterns I recognize are [\"Fluctuating\", \"f\", \"Small spike\",  \"ss\",\"Large spike\",  \"ls\",or \"Decreasing\", \"d\"]");
						}else if(getUserFromMention(args[1]) == null){
							message.reply("Unable to determine what you entered for " + whatUser + "'s previous pattern.\nThe patterns I recognize are [\"Fluctuating\", \"f\", \"Small spike\",  \"ss\",\"Large spike\",  \"ls\",or \"Decreasing\", \"d\"]");
						}
					}
				}				
				
				const sundayPrice = await Stonks.findOne({where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});	
				
				if(!sundayPrice){
					if (whatUser === message.author.username){
						return message.reply("You do not have a buying price entered for this week. Use \"!stonks buy [price]\" to enter the price you bought at.");
					}else{
						return message.reply(whatUser + " does not have a buying price entered for this week.");
					}
				}
				
				var buyPrice = sundayPrice.price;
				var allPrice;
				var allWeekPrices = [buyPrice, buyPrice, , , , , , , , , , , , ,];
				if (sundayPrice.day > d.getDate()){
					var x = new Date();
					x.setDate(0);
					const lastHalfprices = await Stonks.findAll({order: [ [ 'createdAt', 'ASC' ]] ,where: {[Op.and]: [ {day: {[Op.between]: [1, parseInt(d.getDate())]}}, {username: whatUser}, {month: month[d.getMonth()]}]}});
					const firstHalfprices = await Stonks.findAll({order: [ [ 'createdAt', 'ASC' ]] ,where: {[Op.and]: [ {day: {[Op.between]: [parseInt(getLastSunday()) + 1, parseInt(x.getDate())]}}, {username: whatUser}, {month: getLastSundayMonth()}]}});
					console.log("all prices");
					console.log(lastHalfprices);
					allPrice = firstHalfprices.concat(lastHalfprices);
					console.log(allPrice);
					
					
				}else{
					allPrice = await Stonks.findAll({order: [ [ 'createdAt', 'ASC' ]] ,where: {[Op.and]: [ {day: {[Op.between]: [parseInt(getLastSunday()) + 1, parseInt(d.getDate())]}}, {username: whatUser}, {month: getLastSundayMonth()}]}});

					if(allPrice === undefined || allPrice.length == 0){
						return message.reply("No prices found this week. A buying price and one stalk price are needed to predict");
					}
					
				}			
				
				allWeekPrices = getPriceArray(allPrice, allWeekPrices);
								
				var foundResults = false;
				var loopsDone = 0;
				var temp;
				while(!foundResults){
					temp  = predicting.analyze_possibilities(allWeekPrices, false, whatPatterntoUse, loopsDone);
					if(temp.length > 1){
						foundResults = true;
					}else if(temp[0].pattern_number < 4){
						foundResults = true;
					}else if(loopsDone === 5){
						return message.reply("Could not find results with fudge factors 0-5");
					}else{
						loopsDone++;
					}
					
					
				}
				
				//console.log(temp);
				console.log(allWeekPrices);
				var i;
				var j;
				var highDay = 0;
				var highTime = "AM";
				var haveGoodGuess = false;
				var differentPatterns = ["Fluctuating", "Large spike", "Decreasing", "Small spike"];
				var differentProbabilities = [0, 0, 0, 0];
				var probMax = [0, 0, 0, 0];
				var probMin = [1000, 1000, 1000, 1000];
				for (i = 0; i < temp.length; i++) {
					if (temp[i].category_total_probability !== undefined){
						if (Number(temp[i].probability) >= .5){
							for (j = 2; j < 14; j++){
								if(Number(temp[i].prices[j].max)=== Number(temp[i].weekMax)){
									var tempNum = j;
									highDay = Math.floor(tempNum / 2);
									if(j % 2 === 1){
										highTime = "PM";
									}
									haveGoodGuess = true;
								}
							}
						}
						differentProbabilities[temp[i].pattern_number] = Math.floor(Number(temp[i].category_total_probability) * 100);
						if (Number(probMax[temp[i].pattern_number]) < Number(temp[i].weekMax)){
							probMax[temp[i].pattern_number] = temp[i].weekMax;
						}
						if (Number(probMin[temp[i].pattern_number]) > Number(temp[i].weekGuaranteedMinimum)){
							probMin[temp[i].pattern_number] = temp[i].weekGuaranteedMinimum;
						}
					}
				}
				if(highDay > 0){
					highDay = theDay[highDay];
				}


				i = 0;
				var hasMessage = false;
				var differntPatterns = 0;
				console.log("Fudge factor used to find prices was set at " + loopsDone);
				var messageContents = "Calculate I do that " + whatUser + " has a:";
				for (i = 0; i < 4; i++) {
					if(Number(differentProbabilities[i]) > 0){
						if(haveGoodGuess && Number(differentProbabilities[i]) >= 50){
							messageContents = messageContents + "\n" + differentProbabilities[i] + "% chance of a " + differentPatterns[i] + " pattern this week with a max price of " + probMax[i] + " bells on " + highDay + " in the " + highTime + " and a price at least as high as " + probMin[i] + " bells.";
							hasMessage = true;
						}else{
							messageContents = messageContents + "\n" + differentProbabilities[i] + "% chance of a " + differentPatterns[i] + " pattern this week with a max price of " + probMax[i] + " bells and a price at least as high as " + probMin[i] + " bells sometime this week.";
							hasMessage = true;
						}
					}
				}
				
				if (!hasMessage){
					return message.reply("Wrong something has gone. Unable to match your results to a pattern I am.");
				}
				
				return message.channel.send(messageContents, { code: true });

				
				
			}else if(args[0].toString().toLowerCase() === "pattern" || args[0].toString().toLowerCase() === "lastpattern" || args[0].toString().toLowerCase() === "lp" || args[0].toString().toLowerCase() === "pat" || args[0].toString().toLowerCase() === "patt"){
			
				var givenPattern;
				var whatUser = message.author.username;
				var sundayPrice;
				if (!args[1]){
					return message.reply("Enter your previous pattern as !stonks \"pattern\" [\"Fluctuating\", \"f\", \"Small spike\",  \"ss\",\"Large spike\",  \"ls\",or \"Decreasing\", \"d\"]");
				}else if(getUserFromMention(args[1]) != null){
					var user = getUserFromMention(args[1]);
					whatUser = user.username;
					
					args[2].toLowerCase();
					givenPattern =  givenPattern = args[2].charAt(0).toUpperCase() + args[2].slice(1);
					if(args[3]){
						args[3].toLowerCase();
						givenPattern = givenPattern + " " + args[3];
					}
					givenPattern = givenPattern.toString();
					
				}else{
					args[1].toLowerCase();
					givenPattern =  givenPattern = args[1].charAt(0).toUpperCase() + args[1].slice(1);
					if(args[2]){
						args[2].toLowerCase();
						givenPattern = givenPattern + " " + args[2];
					}
					givenPattern = givenPattern.toString();
				}
				try{
					switch(givenPattern){
						case"Fluctuating":
							sundayPrice = await Stonks.update({lastPattern: "Fluctuating"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as Fluctuating");
							break;
						case"F":
							sundayPrice = await Stonks.update({lastPattern: "Fluctuating"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as Fluctuating");
							break;
						case"Small spike":
							sundayPrice = await Stonks.update({lastPattern: "Small spike"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as a Small spike");
							break;
						case"Ss":
							sundayPrice = await Stonks.update({lastPattern: "Small spike"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as a Small spike");
							break;
						case"Large spike":
							sundayPrice = await Stonks.update({lastPattern: "Large spike"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as a Large spike");
							break;
						case"Ls":
							sundayPrice = await Stonks.update({lastPattern: "Large spike"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as a Large spike");
							break;
						case"Decreasing":
							sundayPrice = await Stonks.update({lastPattern: "Decreasing"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as Decreasing");
							break;
						case"D":
							sundayPrice = await Stonks.update({lastPattern: "Decreasing"},{where: {[Op.and]: [ {day: getLastSunday()}, {username: whatUser}, {month: getLastSundayMonth()}]}});
							return message.reply(whatUser + " pattern for last week is now set as Decreasing");
							break;
						default:
							return message.reply("Unable to determine what you entered.\nThe patterns I recognize are [\"Fluctuating\", \"f\", \"Small spike\",  \"ss\",\"Large spike\",  \"ls\",or \"Decreasing\", \"d\"]");
					}
					return message.reply("return statement not hit");
		
				}catch(e){
					console.log(e);
					return message.reply(whatUser + " does not have a sunday price entered. use \"!stonks [price]\" if it is Sunday or \"!stonks buy [price]\" to enter a Sunday price on a later day.");
				}
			}else{
				return message.reply("Could not recognize command try \"!stonks [price]\" or \"!stonks update [new price]\" or \"!stonks buy [new price]\"");
			}
			

		}
		catch(e){
			console.log(e);
		}
	}
	
	
	if (command === 'hotitem' || command === 'hi') {
		var d = new Date();
		var month = new Array();
		month[0] = "January";
		month[1] = "February";
		month[2] = "March";
		month[3] = "April";
		month[4] = "May";
		month[5] = "June";
		month[6] = "July";
		month[7] = "August";
		month[8] = "September";
		month[9] = "October";
		month[10] = "November";
		month[11] = "December";		
		try{
		if(!args[0]){		
			const allItems = await hotItems.findAll({ limit: 10,order: [ [ 'createdAt', 'DESC' ]] ,});
			if(allItems === undefined || allItems.length == 0){
				return message.reply("No hot items could be found in the database");
			}
			const messageContentsArray = allItems.map(thisItem => thisItem.username + "'s hot item on " + thisItem.month + " " + thisItem.day + " was a " + thisItem.item);
			var messageContents = " ";

			var i;
			for (i = 0; i < allItems.length; i++) {
				if(allItems[i].price > 0){
					messageContentsArray[i] = messageContentsArray[i] + " which sells for " + allItems[i].price + " bells"
				}
			}
			messageContents = "The last " + i + " hot items were:\n" + messageContentsArray.join("\n");

				
			return message.channel.send(messageContents, { code: true });
		} else if(getUserFromMention(args[0]) != null){	
			const user = getUserFromMention(args[0]);		
			const allItems = await hotItems.findAll({ limit: 10,where: {username: user.username}, order: [ [ 'createdAt', 'DESC' ]] ,});
			const messageContentsArray = allItems.map(thisItem => thisItem.item + " on " + thisItem.month + " " + thisItem.day);
			var messageContents = " ";

			var i;
			for (i = 0; i < allItems.length; i++) {
				if(allItems[i].price > 0){
					messageContentsArray[i] = allItems[i].item + " selling for " + allItems[i].price + " bells on " + allItems[i].month + " " + allItems[i].day
				}
			}
			messageContents = "The last " + i + " hot items for " + user.username + " were:\n" + messageContentsArray.join("\n");

				
			return message.channel.send(messageContents, { code: true });

		} else if(args[0].toString().toLowerCase() === "delete" || args[0].toString().toLowerCase() === "remove"){	
		
			if(!args[1]){
				return message.reply("Please enter an item name to delete or type all after remove/delete to remove all your items" );
			}
			if(args[1].toString().toLowerCase() === "all"){
				const rowCount = await hotItems.destroy({ where: { username: message.author.username } });
				return message.reply("All of " +  message.author.username + "'s items have been deleted");
			}

			args.shift();
			var getitem = args;
			var whatitem = getitem.join(" ");
			if (message.author.username === 'cubsr'){
				const rowCount = await hotItems.destroy({ where:  {item: {[Op.like]: whatitem}}});
				if (!rowCount) return message.reply('could not find item named \"' + whatitem + "\" please check your spelling." );
				
				return message.reply(whatitem + " has been deleted");
			}
			const rowCount = await hotItems.destroy({ where:  {[Op.and]: [ {item: {[Op.like]: whatitem}}, {username: message.author.username}]}});
			if (!rowCount) return message.reply('could not find item named \"' + whatitem + "\"  entered by you please check your spelling." );

			return message.reply(whatitem + " has been deleted");
		} else if(args[0].toString().toLowerCase() === "update" || args[0].toString().toLowerCase() === "updateitem"){	
		
			const todayItem = await hotItems.findOne({where: {[Op.and]: [ {day: d.getDate()}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
		
			if(!todayItem){
				return message.reply("You have not entered a hot item today");
			}
			
			
		
		} else if(!isNaN(args[0]) && args.length < 2){	
		
			const todayItem = await hotItems.findOne({where: {[Op.and]: [ {day: d.getDate()}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
			
			if(!todayItem){
				return message.reply("You have not entered a hot item today");
			}
			
			itemPrice = parseInt(args.pop());
			todayItem.update({ price: itemPrice});
			return message.reply(todayItem.item + " has been updated to cost " + itemPrice + " bells.");
			
		} else if(args[0].toString().toLowerCase() === "changemyitem" || args[0].toString().toLowerCase() === "cmi"){	
			var getitem = args.slice(1);
			var itemPrice = 0;
			var theDay = d.getDate();
		
			
			const anotherHot = await hotItems.findOne({where: {[Op.and]: [ {day: theDay}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
			
			if(!anotherHot){
				return message.reply("You have not entered a hot item today");
			}
			
			if(d.getHours() < 4 && d.getDate > 1){
				theDay = theDay - 1;
			}
			
			if (!isNaN(args[(args.length - 1)])){
				itemPrice = parseInt(args.pop());
				getitem = args;				
			}
			else{				
				const tempItem = getitem.join(" ");
				const checkBefore = await hotItems.findOne({where: {[Op.and]: [ {item: {[Op.like]: tempItem}}, {price: {[Op.gte]: 1}}]}});
				if(checkBefore){
					itemPrice = checkBefore.price;
					message.reply("A price for " + tempItem + " has previously been set at " + itemPrice + " bells. If you know this to be wrong update the price by typing \"!hi (the new price)\"");
				}
			}			

			const whatItem = getitem.join(" ");
			
			anotherHot.update({ price: itemPrice});
			anotherHot.update({ item: whatItem});
			
			
			var messageContents = "temp";
			if (itemPrice > 0){
				messageContents = anotherHot.username + "'s hot item on " + anotherHot.month + " " + anotherHot.day + " is a " + anotherHot.item + " which sells for " + itemPrice + " bells";
			}else{
				messageContents = anotherHot.username + "'s hot item on " + anotherHot.month + " " + anotherHot.day + " is a " + anotherHot.item;
			}
			
			message.channel.send(messageContents, { code: true });
			const TradeCheck = await theMarket.findAll({ where:  {[Op.and]: [{buysell: "sell"}, {item: {[Op.like]: whatItem}}]}});
			if(TradeCheck){
				const TrademessageContents = TradeCheck.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "Error?";
				if(TrademessageContents === "Error?") return;
				message.reply(TrademessageContents);
			}	
		
		}else{
			
			const todayItem = await hotItems.findOne({where: {[Op.and]: [ {day: d.getDate()}, {username: message.author.username}, {month: month[d.getMonth()]}]}});
			
			if(todayItem){
				return message.reply("You have already entered " + todayItem.item + " as your hot item today. To change it type \"!hi\" \"ChangeMyItem\" or \"cmi\" then your new item name and price if you know it.");
			}
			var getitem = args;
			var itemPrice = 0;
			var theDay = d.getDate();
			
			if(d.getHours() < 4 && d.getDate > 1){
				theDay = theDay - 1;
			}
			
			if (!isNaN(args[(args.length - 1)])){
				itemPrice = parseInt(args.pop());
				getitem = args;				
			}
			else{
				
				const tempItem = getitem.join(" ");
				const checkBefore = await hotItems.findOne({where: {[Op.and]: [ {item: {[Op.like]: tempItem}}, {price: {[Op.gte]: 1}}]}});
				if(checkBefore){
					itemPrice = checkBefore.price;
					message.reply("A price for " + tempItem + " has previously been set at " + itemPrice + " bells. If you know this to be wrong update the price by typing \"!hi (the new price)\"");
				}
			}			

			const whatItem = getitem.join(" ");
			
			const anotherHot = await hotItems.create({
				month: month[d.getMonth()],
				day: theDay,
				item: whatItem,
				username: message.author.username,
				price: itemPrice,
			});
			var messageContents = "temp";
			if (itemPrice > 0){
				messageContents = anotherHot.username + "'s hot item on " + anotherHot.month + " " + anotherHot.day + " is a " + anotherHot.item + " which sells for " + itemPrice + " bells";
			}else{
				messageContents = anotherHot.username + "'s hot item on " + anotherHot.month + " " + anotherHot.day + " is a " + anotherHot.item;
			}
			
			message.channel.send(messageContents, { code: true });
			const TradeCheck = await theMarket.findAll({ where:  {[Op.and]: [{buysell: "sell"}, {item: {[Op.like]: whatItem}}]}});
			if(TradeCheck){
				const TrademessageContents = TradeCheck.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "Error?";
				if(TrademessageContents === "Error?") return;
				message.reply(TrademessageContents);
			}
		}
		return;
		}
		catch (e){
			console.log(e);
			return;
		}
	}
	
	if (command === 'echo') {		
		try{
			var echoing = withoutPrefix.slice(5);
			if (echoing){
			message.channel.send(echoing);
			return;
			}
			message.channel.send("nothing to echo");
			return;
		}
		catch (e){
			message.channel.send("nothing to echo");
			return;
		}
	
	}
	
	if (command === 'addtrade' || command === 'at' || command === 'buy' || command === 'sell') {
		if (command === 'buy' || command === 'sell'){
			args.unshift("placeholder");
		}
		var whatdo;
		var whatitem;
		var whatprice = -1;
		try{
			args[0]= args[0].toString().toLowerCase();
			if (args[0] == 'buy' || command === 'buy'){
				whatdo = "buy";
			} else if(args[0] == 'sell' || command === 'sell'){
				whatdo = "sell";
			}else {
				message.reply("Please use the format !addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)");
				return;
			}
			
			if (!args[1]){
				message.reply("Please enter a price after \"buy\" or \"sell\" the command format is: !addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)");
				return;
			}else if(isNaN(args[1])){
				message.reply("Please enter a number for your price. The command format is: !addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)");
				return;
			}else if(parseInt(args[1]) < 0){
				message.reply("Please enter a positive number for your price. The command format is: !addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)");
				return;
			}else {
				whatprice = parseInt(args[1]);
			}
			if (!args[2]){
				message.reply("Please enter the name of the item after the price. The command format is: !addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)");
				return;
			}
			
			var getitem = args;

			getitem.shift();
			getitem.shift();
			whatitem = getitem.join(" ");
			if (whatitem.length < 3){
				message.reply("Please enter a real item name after the price. The command format is: !addtrade (\"buy\" or \"sell\") (price you want to buy or sell the the item for) (the item you want to buy or sell)");
				return;
			}
			
			
			message.channel.send("@here " + message.author.username + " is " + whatdo + "ing " + whatitem + " for " + whatprice + " bells!");
			//client.channels.get("").send("@here " + message.author.username + " is " + whatdo + "ing " + whatitem + " for " + whatprice + " bells!");
			
			
	const shop = await theMarket.create({
				buysell: whatdo,
				item: whatitem,
				username: message.author.username,
				price: whatprice,
			});
			//message.reply(`Shop ${shop.item} added.`);
			if (whatdo === "buy"){
				return;
			}
			var d = new Date();
			var month = new Array();
			month[0] = "January";
			month[1] = "February";
			month[2] = "March";
			month[3] = "April";
			month[4] = "May";
			month[5] = "June";
			month[6] = "July";
			month[7] = "August";
			month[8] = "September";
			month[9] = "October";
			month[10] = "November";
			month[11] = "December";	

			const gethotitems = await hotItems.findAll({ where:  {[Op.and]: [{month: month[d.getMonth()]}, {item: {[Op.like]: whatitem}}, {day: d.getDate()}]}});
			const TradeMatchmessageContents = gethotitems.map(shop => shop.username + " hot item today happens to be a " + shop.item).join('\n') || "No Trades";
			if (TradeMatchmessageContents !== "No Trades"){
				return message.channel.send(TradeMatchmessageContents, { code: true });
			}
			return;
		}
		catch (e){
			console.log(e);
			message.reply("bad information entered");
			return;
		}

	
	
		return;
	}
	
	if (command === 'deletetrade' || command === 'deltrade' || command === 'dt' ) {

		try{
			if(!args[0]){
				message.reply('Please enter the name of the item you want to delete');
				return;
			}
			if(!args[1]){
				var getitem = args;
				if (args[0] == "all" || args[0] == "All"){
					const rowCount = await theMarket.destroy({ where: { username: message.author.username } });
					if (!rowCount) return message.reply('You have no items to delete');
					return message.reply('All of your trade requests were deleted');
				}
				const rowCount = await theMarket.destroy({ where: { item: getitem } });
				if (!rowCount) return message.reply('That item does not exist.');
				return message.reply('Item deleted');
			}
			var getitem = args;
			whatitem = getitem.join(" ");
			const rowCount = await theMarket.destroy({ where: { item: whatitem } });
			if (!rowCount) return message.reply('could not find item named\"' + whatitem + "\" please check your capitalization and spelling." );

			return message.reply('Item deleted');
		}
		catch (e){
			message.reply("bad information entered");
			return;
		}

	
	
		return;
	}
	
	if (command === 'gettrade' || command === 'gettrades' || command === 'gt' ) {

		try{
			if(!args[0]){
				const items = await theMarket.findAll();
				items.sort((a, b) => b.price - a.price)
				const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items are in the database";
				return message.channel.send(messageContents, { code: true });
			}
			if(!isNaN(args[0])){
				if(!args[1]){
					const searchPrice = parseInt(args[0]);
					const items = await theMarket.findAll({ where: {price: {[Op.lte]: searchPrice} } });
					items.sort((a, b) => b.price - a.price)
					const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items less than " + searchPrice + " bells.";
					return message.channel.send(messageContents, { code: true });
				}else if(!isNaN(args[1])){
					var lowsearchPrice = parseInt(args[0]);
					var highsearchPrice = parseInt(args[1]);
					if (highsearchPrice < lowsearchPrice){
						var temp = highsearchPrice;
						highsearchPrice = lowsearchPrice;
						lowsearchPrice = temp;
					}
					const items = await theMarket.findAll({ where: {price: {[Op.between]: [lowsearchPrice, highsearchPrice]} } });
					const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items between " + lowsearchPrice + " and " + highsearchPrice + " bells.";
					return message.channel.send(messageContents, { code: true });
				}else if(getUserFromMention(args[1]) != null){
					const user = getUserFromMention(args[1]);
					const searchPrice = parseInt(args[0]);
					const items = await theMarket.findAll({ where: {price: {[Op.lte]: searchPrice}, username: user.username  } });
					const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items less than " + searchPrice + " bells.";
					return message.channel.send(messageContents, { code: true });
				}else{
				const searchPrice = parseInt(args[0]);
				const items = await theMarket.findAll({ where: {price: {[Op.lte]: searchPrice} } });
				const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items less than " + searchPrice + " bells.";
				return message.channel.send(messageContents, { code: true });
				}
			}
			if(getUserFromMention(args[0]) != null){
				if(!args[1]){
					const user = getUserFromMention(args[0]);
					const items = await theMarket.findAll({ where: { username: user.username } });
					const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "Could not find any items for " + user.username;
					return message.channel.send(messageContents, { code: true });
				}else if(!isNaN(args[1])){
					const user = getUserFromMention(args[0]);
					const searchPrice = parseInt(args[1]);
					const items = await theMarket.findAll({ where: {price: {[Op.lte]: searchPrice}, username: user.username  } });
					const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items less than " + searchPrice + " bells.";
					return message.channel.send(messageContents, { code: true });
				}
			}else if(args[0] === "age"){
				const items = await theMarket.findAll();
				const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "No items are in the database";
				return message.channel.send(messageContents, { code: true });			
			}else{
				var getitem = args;

				var whatItem = getitem.join(" ");

				const items = await theMarket.findAll({ where: {item: {[Op.like]: whatItem} } });
				const messageContents = items.map(shop => shop.username + " is " + shop.buysell + "ing " + shop.item + " for " + shop.price + " bells!").join('\n') || "Could not find item like " + whatItem;
				return message.channel.send(messageContents, { code: true });
			}
		}
		catch (e){
			console.log(e);
			message.channel.send("A caught JS error occured during the last command.");
			return;
		}

	
		message.reply("Not able to search for trade offers from your request");
		return;
	}
	
	if (command === 'ping') {
		message.channel.send('Pong');
		return;
	}
	
	if (command === 'poe2') {
		message.channel.send('There are many days until Path of Exile 2 releases.');
		return;
	}	
	
	if(command === 'terraria' || command === 'te' || command === 'je' || command === 'journeysend') {

		var currentTime = new Date();
		var hours = currentTime.getHours();	
		var date = currentTime.getDate();
		if (date >= 16 && hours >= 11){
			message.reply('Journeys End has released!');
			return;
		}
		var minutes = currentTime.getMinutes();	
		var seconds = currentTime.getSeconds();
		if (date < 16){
			hours = 34 - hours;
		}else{
			hours = 10 - hours;
		}

		minutes = 59 - minutes;
		seconds = 59 - seconds;
		message.reply(hours + " hours " + minutes + " minutes and " + seconds + " seconds until Journeys End release");
		return;
	}
});
client.login();



function getUserFromMention(mention) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<@!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	const id = matches[1];

	return client.users.cache.get(id);
}

function getLastSunday(){
	
	var SundayDate = 0;
	
	var d = new Date();
	var weekDay = d.getDay();
	if (weekDay === 0){
		SundayDate = d.getDate();
	}else{
		if (d.getDate() - weekDay < 1){
			var temp = weekDay - d.getDate();
			var x = new Date();
			x.setDate(0);
			console.log(x.getDate());
			SundayDate = x.getDate() - temp;
			console.log(SundayDate);
		}else{
			SundayDate = d.getDate() - weekDay;
		}
	}
	
	return SundayDate;
	
}

function dateSorter(allEntries){
	try{
		var x = new Date();
		var d = new Date();
		x.setDate(0);
		if(allEntries.length < 2){
			return allEntries;
		}
		var i;
		var isSorted = false;
		while(!isSorted){
			isSorted = true;
			for(i = 0; i < allEntries.length - 1; i++){
				if(allEntries[i].month === x.getMonth() && allEntries[i].month === allEntries[i + 1].month){
					var temp = allEntries[i];
					allEntries[i] = allEntries[i + 1];
					allEntries[i + 1] = temp;
					isSorted = false;
				}
			}
		}
		isSorted = false;
		while(!isSorted){
			isSorted = true;
			for(i = 0; i < allEntries.length - 1; i++){
				if(allEntries[i].day > allEntries[i + 1].day && allEntries[i].month === allEntries[i + 1].month){
					var temp = allEntries[i];
					allEntries[i] = allEntries[i + 1];
					allEntries[i + 1] = temp;
					isSorted = false;
				}
			}
		}
		isSorted = false;
		while(!isSorted){
			isSorted = true;
			for (i = 0; i < allEntries.length - 1; i++){
				if(allEntries[i].day === allEntries[i + 1].day){
					if(allEntries[i].AMPM === "PM" && allEntries[i + 1].AMPM === "AM"){
						var temp = allEntries[i];
						allEntries[i] = allEntries[i + 1];
						allEntries[i + 1] = temp;
						isSorted = false;
					}
				}
			}
		}
		return allEntries;
	}
	catch(e){
		console.log(e);
		//message.channel.send("Date sorting broken");
	}
}

function getPriceArray(allPrice, allWeekPrices){
	var i = 0;
	var x = new Date();
	var d = new Date();
	
	x.setDate(0);
	console.log("before");
	console.log(allPrice);
	allPrice = dateSorter(allPrice);
	console.log("after");
	console.log(allPrice);
	
	var stonksDays = 0;
	var dayStart = parseInt(getLastSunday()) + 1;
	
	for (i = 2; i < 13; i++){
		console.log("comparing " + dayStart + " to " + allPrice[stonksDays].day);
		
		if (dayStart === allPrice[stonksDays].day){
			if (i % 2 === 0){
				if (allPrice[stonksDays].AMPM === "AM"){
					allWeekPrices[i] = allPrice[stonksDays].price;
					stonksDays++;
					//console.log("AM STONK found");
				}
			}else{
				if (allPrice[stonksDays].AMPM === "PM"){
					allWeekPrices[i] = allPrice[stonksDays].price;
					stonksDays++;
					dayStart++;
					//console.log("PM STONK found");
				}
			}
		}else{
			if (i % 2 === 0){
				i = i + 1;
			}
			
			dayStart++;
			
			if (dayStart > x.getDate()){
				dayStart = 1;
			}
		}
		if(stonksDays === allPrice.length){
			i = 14;
		}
	}
	return allWeekPrices;
}

function getLastSundayMonth(){
	
	var d = new Date();
		var month = new Array();
		month[0] = "January";
		month[1] = "February";
		month[2] = "March";
		month[3] = "April";
		month[4] = "May";
		month[5] = "June";
		month[6] = "July";
		month[7] = "August";
		month[8] = "September";
		month[9] = "October";
		month[10] = "November";
		month[11] = "December";	
		
	var SundayDate = 0;
	
	var d = new Date();
	var weekDay = d.getDay();
	if (weekDay === 0){
		SundayDate = d.getDate();
	}else{
		if (d.getDate() - weekDay < 1){
			var temp = weekDay - d.getDate();
			var x = new Date();
			x.setDate(0);
			SundayDate = x.getDate() - temp;
		}else{
			SundayDate = d.getDate() - weekDay;
		}
	}
	
	if(SundayDate > d.getDate()){
		var x = new Date();
		x.setDate(0);
		return month[x.getMonth()];
	}else{
		return month[d.getMonth()];
	}
	
}


function getAMPM(username){
		
	var d = new Date();
	var hour;
	var timestamp = "AM";
	if(username === "Mountain Time"){
		hour = d.getHours();
	}else if(username === "Eastern Time" || username === "Eastern Time 2"){
		hour = d.getHours() + 2;
		if (hour === 24){
			hour = 0;
		}else if(hour === 25){
			hour = 1;
		}
	}else{
		var hour = d.getHours() + 1;
		if (hour === 24){
			hour = 0;
		}
	}
	if (hour > 11){
		timestamp = "PM";
	}
	
	return timestamp;
	
}


/*
if(nameChecks.length > 0){
					var hasHI = false;
					var i;
					for (i = 0; i < nameChecks.length; i++) {
						if(nameChecks[i] === message.author.username){
							hasHI = true;
						}
					}
				}
				
				if(!hasHI){
					nameChecks.push(message.author.username);
					message.reply("!HotItem or !hi has a new feature! You now have the option to add the price after your hot item! If you dont know the price just type in your item name, but if you learn the price of your hot item later today type !hi (your item price)!");
				}
*/




/*
	//searches the message if some form of UWU is in it and deducts arbitrary points from user
	if (message.content.includes('uwu') || message.content.includes('UWU') || message.content.includes('uWu') || message.content.includes('UwU')) {
		//these three lines get the value of points from the database based off the message author subtract from it then put the new number into the database
		const Point = await DominantPoints.findOne({ where: { name: message.author.username } });
		var newpoint = parseInt(Point.get('UserPoints')) - 15;
		const Point2 = await DominantPoints.update({ UserPoints: newpoint }, { where: { name: message.author.username } });
		message.reply("UWU DETECTED! Subtracting 15 points from " + message.author.username + "'s Dominant point score! " + message.author.username + " now has " + newpoint + " Dominant Points!");
		return;
	}
	
	//searches the message if some form of OWO is in it and deducts arbitrary points from user
	if (message.content.includes('owo') || message.content.includes('OWO') || message.content.includes('oWo') || message.content.includes('OwO') || message.content.includes('0w0')) {
		//these three lines get the value of points from the database based off the message author subtract from it then put the new number into the database
		const Point = await DominantPoints.findOne({ where: { name: message.author.username } });
		var newpoint = parseInt(Point.get('UserPoints')) - 10;
		const Point2 = await DominantPoints.update({ UserPoints: newpoint }, { where: { name: message.author.username } });
		message.reply("OWO DETECTED! Subtracting 10 points from " + message.author.username + "'s Dominant point score! " + message.author.username + " now has " + newpoint + " Dominant Points!");
		return;
	}
*/
