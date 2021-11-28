const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const usetube = require("usetube");
require('dotenv').config();

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

        function skip() {
          console.log("skipping dicks");
          queue.shift();
          queue.forEach((item) => {
            connection.play(
              ytdl(`https://www.youtube.com/watch?v=${item.id}`, {
                filter: "audioonly",
              })
            );
            skip();
          });
        }

        function play(id) {
          connection.play(
            ytdl(`https://www.youtube.com/watch?v=${id}`, {
              filter: "audioonly",
            })
          );
        }

        queue.forEach((item) => {
          play(item.id);

          setTimeout(() => {
            message.channel.send("ended");
          }, parseInt(item.duration) * 1000);
        });
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
        .setColor('AQUA')
        .setTitle(video.title)
        .setDescription(`This song has been added by <@${message.author.id}>`)
      message.channel.send(musicEmbed)
    }

    if (command === "die") {
      message.member.voice.channel.leave();
    }

    if (command === "q") {

      if (queue.length < 1) {
        const sadEmbed = new Discord.MessageEmbed()
          .setColor('RED')
          .setTitle('Queue Is Empty')
        message.channel.send(sadEmbed);
        return;
      }

      const list = queue.map((item, index) => {
        return {
          name: `${index + 1}) **${item.title}**`,
          value: item.id
        }
      });

      const embed = new Discord.MessageEmbed()
        .setColor('AQUA')
        .setTitle('Server Queue')
        .addFields(list);
      message.channel.send(embed);

    }
  }
  
});

client.login(process.env.BOT_TOKEN);
