const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const usetube = require("usetube");
require("dotenv").config();
 
const client = new Discord.Client();
 
const queue = [];
 
client.on("ready", () => {
  console.log("bot ready");
});
 
client.on("message", async (message) => {
  if (message.author.id === client.user.id) return;
 
  // The Commands Go Here
  if (message.content.startsWith("^")) {
    const base = message.content.split(" ")[0].split("");
    base.shift();
    const command = base.join(""); // The command itself
 
    if (command === "play") {
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
 
        function play(id) {
          connection.play(
            ytdl(`https://www.youtube.com/watch?v=${id}`, {
              filter: "audioonly",
            })
          );
 
          function skip() {
            queue.shift();
            play(queue[0].id);
          }
 
          setTimeout(() => {
            message.channel.send(`${queue[0].title} has ended!`);
            skip();
          }, parseInt(queue[0].duration) * 1000);
        }
 
        play(queue[0].id);
      } else {
        message.reply("You need to join a voice channel first!");
      }
    }
 
    if (command === "add") {
      const baseQuery = message.content.split(" ");
      baseQuery.shift();
 
      const query = baseQuery.join(" "); // This is the shit which comes after the ^play command
 
      if (!query) {
        message.channel.send(
          "You gotta tell me the name of the song you dimwit"
        );
        return;
      }
 
      const res = await usetube.searchVideo(query);
      const video = res.videos[0]; // The top most result of the search
 
      queue.push(video);
      const musicEmbed = new Discord.MessageEmbed()
        .setColor("AQUA")
        .setTitle("SONG ADDED")
        .setDescription(`Song added by <@${message.author.id}>`);
      message.channel.send(musicEmbed);
    }
 
    if (command === "die") {
      message.member.voice.channel.leave();
    }
 
    if (command === "q") {
      if (queue.length < 1) {
        const sadEmbed = new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("Queue Is Empty");
        message.channel.send(sadEmbed);
        return;
      }
 
      const list = queue.map((item, index) => {
        return {
          name: `${index + 1}) **${item.title}**`,
          value: item.id,
        };
      });
 
      const embed = new Discord.MessageEmbed()
        .setColor("AQUA")
        .setTitle("Server Queue")
        .addFields(list);
      message.channel.send(embed);
    }
 
    if (command === "rm") {
      const index = message.content.split(" ");
      index.shift();
 
      if (queue.length < parseInt(index)) {
        message.channel.send('That does not exist!')
      } else {
        message.channel.send(
          new Discord.MessageEmbed()
            .setColor('AQUA')
            .setTitle('Item Removed')
            .setDescription(`**${JSON.stringify(queue[index - 1].title)}** has been deleted`)
        )
 
        queue.splice(index - 1, 1);
      }
    }
  }
});
 
client.login(process.env.BOT_TOKEN);
 
