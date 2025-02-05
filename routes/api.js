'use strict';

const { Client } = require('pg');
const postgres_db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // (required for secure Heroku connection)
  },
});
postgres_db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection error', err.stack));

const bcrypt = require('bcrypt');
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = function (app) {

  app.route("/api/load-boards")

    .get(async(req, res) => {

      try {
        const board_list_object = await postgres_db.query(
          "SELECT name FROM boards;"
        )
        const boards_array = board_list_object.rows;
        res.json(boards_array)
      } catch (err) {
        res.text("Server error:", err)
      }
    })

  app.route("/api/create-board")

    .post(async(req, res) => {
      const { new_board_name } = req.body
      try {
        const new_board_object = await postgres_db.query(
          "INSERT INTO boards (name) VALUES ($1) RETURNING name, board_id",
          [new_board_name]
        )
        const new_board_row = new_board_object.rows[0];
        res.json({message: `successfully added ${new_board_row.name} (board id ${new_board_row.board_id})`})
      } catch (err) {
        res.text("Server error:", err)
      }
      
    })

  app.route('/api/threads/:board')
    
    .post ( async ( req, res ) => {

      const { board } = req.params;
      const { text, delete_password } = req.body;
      const now = new Date();
      let board_id = 0;
      try {
        let board_id_row = await postgres_db.query(
          "SELECT board_id FROM boards WHERE name = $1",
          [board]
        );
        if (board_id_row.rows.length === 0) {
          const new_board_id_row = await postgres_db.query(
            "INSERT INTO boards (name) VALUES ($1) RETURNING board_id",
            [board]
          );
          board_id = new_board_id_row.rows[0].board_id
        }  else  {
          board_id = board_id_row.rows[0].board_id
        }
        const hashed_password = await hashPassword(delete_password);
        const post = await postgres_db.query(
          "INSERT INTO threads (board_id, text, created_on, bumped_on, reported, delete_password, replies) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING _id, text, created_on, bumped_on, reported, replies",
          [board_id, text, now, now, false, hashed_password, []]
        );
        res.json({success: true, thread: post.rows[0]})
      } catch (err) {
        console.log("ERROR LOG:", err)
        res.json({message: err})
      }
    })

    .get(async (req, res) => {
      
      const { board } = req.params;
      const output_array = [];
      try {
        const rows = await postgres_db.query(
          "SELECT _id, text, created_on, bumped_on, replies FROM threads INNER JOIN boards ON threads.board_id = boards.board_id WHERE boards.name = $1 ORDER BY bumped_on DESC LIMIT 10",
          [board]
        );

        for (let i = 0; i < rows.rows.length; i++) {
          let thread = rows.rows[i];
          let replies = Array.isArray(thread.replies) ? thread.replies : JSON.parse(thread.replies);
          // clean reply objects
          replies = replies.map(reply => ({
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on
            }
          ));
          if (replies.length > 3) {
            replies = replies.slice(0, 3);
          }
          output_array.push({
            ...thread,
            replies
          });
        }

        res.json(output_array);

      } catch (err) {
        console.log("ERROR LOG:", err);
        res.json({ message: err });
      }
    })

    .delete(async(req, res) => {
      
      const {thread_id, delete_password} = req.body;
      try {
        const thread_password_hashed = await postgres_db.query(
          "SELECT delete_password FROM threads WHERE _id = $1",
          [thread_id]
        );
        const isMatch = await bcrypt.compare(delete_password, thread_password_hashed.rows[0].delete_password);
        if (!isMatch) return res.send("incorrect password");
        const deleted_row = await postgres_db.query(
          "DELETE FROM threads WHERE _id = $1",
          [thread_id]
        );
        res.send('success');
      } catch(err) {
        res.json({message: err})
      };
    })

    .put(async(req, res) => {
      
      const {thread_id} = req.body;
      try {
        const reported_thread = await postgres_db.query(
          "UPDATE threads SET reported = TRUE WHERE _id = $1",
          [thread_id]
        );
        res.send('reported');
      } catch(err) {
        console.log("ERROR LOG:", err);
        res.json({message: err});
      };
    });
    
  app.route('/api/replies/:board')

    .post( async (req, res) => {

      const { board } = req.params;
      const { text, delete_password, thread_id } = req.body;
      console.log("post reply req.body:", req.body)
      const now = new Date();
      try {
        const hashed_password = await hashPassword(delete_password);
        const reply_row = await postgres_db.query(
          "SELECT * FROM threads WHERE _id = $1",
          [thread_id]
        );
        const replies_array = reply_row.rows[0].replies;
        const new_reply = {
          _id: replies_array.length + 1,
          text,
          created_on: now,
          delete_password: hashed_password,
          reported: false
        };
        const updated_replies_array = [new_reply, ...replies_array];
        const updated_row = await postgres_db.query(
          "UPDATE threads SET replies = $1 WHERE _id = $2",
          [updated_replies_array, thread_id]
        );
        const bumped_on_updated = await postgres_db.query(
          "UPDATE threads SET bumped_on = $1 WHERE _id = $2",
          [now, thread_id]
        );
        res.json({success: true, reply: new_reply})
      } catch (err) {
        console.log("ERROR LOG:", err);
        res.json({message: err})
      }
    })

  .get(async(req, res) => {

    const {thread_id} = req.query;
    try {
      const rows = await postgres_db.query(
        "SELECT _id, board_id, text, created_on, bumped_on, replies FROM threads WHERE _id = $1",
        [thread_id]
      );
      const replies_array = rows.rows[0].replies;
      const clean_replies_array = replies_array.map(reply => {
        return ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on
        })
      })
      rows.rows[0].replies = clean_replies_array;
      res.json(rows.rows[0]);
    } catch(err) {
      res.json({message: err});
    };
  })

  .delete(async(req, res) => {

    const {thread_id, delete_password, reply_id} = req.body;
    try {
      const replies_row = await postgres_db.query(
        "SELECT replies FROM threads WHERE _id = $1",
        [thread_id]
      );
      let replies_array = replies_row.rows[0].replies;
      const target_reply_index = replies_array.findIndex(reply => reply._id === parseInt(reply_id));
      const isMatch = await bcrypt.compare(delete_password, replies_array[target_reply_index].delete_password);
      if (!isMatch) {
        return res.send("incorrect password")
      };
      replies_array[target_reply_index].text = "[deleted]";
      const updated_replies_array = await postgres_db.query(
        "UPDATE threads SET replies = $1 WHERE _id = $2",
        [replies_array, thread_id]
      );
      res.send('success');
    } catch(err) {
      console.log("ERROR LOG:", err);
      res.json({message: err});
    };
  })

  .put(async(req, res) => {
    
    const {thread_id, reply_id} = req.body;
    try {
      const target_row = await postgres_db.query(
        "SELECT replies FROM threads WHERE _id = $1",
        [thread_id]
      );
      const replies_array = target_row.rows[0].replies;
      const target_reply_index = replies_array.findIndex(reply => reply._id === parseInt(reply_id));
    replies_array[target_reply_index].reported = true;
      res.send('reported');
    } catch(err) {
      console.log("ERROR LOG:", err);
      res.json({message: err});
    };
  })

};
