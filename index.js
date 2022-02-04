const TelegramApi = require ('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');
const sequelize = require('./db.js');
const UserModel = require('./models')

const token = "5246209464:AAHW41biSvcynz6rizwuVtNMHgn-75glZ3Q";

const bot = new TelegramApi(token, {polling: true});

const chats = {}

const startGame = async (chatId) => {
        await bot.sendMessage(chatId, 'I will guess a number from 0 to 9, and you will have to guess it.');
        const randomNumber = Math.floor(Math.random() * 10);
        chats[chatId] = randomNumber;
        await bot.sendMessage(chatId, 'I guessed, now guess!', gameOptions);;
}

const start = async () => {
    try {
        
        await sequelize.authenticate();
        await sequelize.sync();

    } catch (error) {

        console.log('Bot can\'t to connect by DataBase', error);

    }

    bot.setMyCommands([
        {command: '/start', description: 'initial greeting'},
        {command: '/info', description: 'get information'},
        {command: '/game', description: 'play game'}
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        try {
           
            if (text === `/start`){
                await UserModel.create({chatId})
                await bot.sendMessage(chatId, `Добро пожаловать, я телеграм бот Hatori_Chise!`)
                return bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/273/e5d/273e5d86-4da7-35da-bb99-f440dcef13ff/2.webp')
             }
             if(text === '/info'){
                 const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Меня зовут Hatori Chise, а тебя ${msg.from.first_name} ${msg.from.last_name}!, 
                in game you have ${user.right} correct answers and ${user.wrong} wrong answers`)
             }
             if(text === '/game'){
                 startGame(chatId)
             }
     
             return bot.sendMessage(chatId, "I don't understand you.")

        } catch (error) {

            return bot.sendMessage(chatId, 'Ooops, somethings wrong...')
            
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        
        if(data === '/again'){
          return startGame(chatId)
        }

        const user = await UserModel.findOne({chatId});

        if(+data === chats[chatId]){
            user.right += 1;
            await bot.sendMessage(chatId, `Congratulations, you guessed the correct number! ${chats[chatId]}`, againOptions)
        } else{
            user.wrong += 1;
            await bot.sendMessage(chatId, `I\'m sorry, but you not guessed correct number, correct numbers is the ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}

start()