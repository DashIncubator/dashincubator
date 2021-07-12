const { Router } = require("express");
const { ObjectID, ObjectId } = require("mongodb");
const { getTable } = require("../dal");
const { authHandlers } = require("../handlers");

const router = Router();
const bountiesCollection = getTable("bounties");
const tasksCollection = getTable("tasks");
const activityCollection = getTable("activity");
const usersCollection = getTable("users");
const notificationsCollection = getTable("notifications");

router.get(
  "/",
  ...authHandlers(async (req, res) => {
    bountiesCollection.aggregate([
      { $match: { type: "bounty" } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "bountyID",
          as: "tasks",
        }
      },
      {
        $lookup: {
          from: "activity",
          localField: "_id",
          foreignField: "bountyID",
          as: "comments"
        }
      }
    ])
      .toArray((err, bounties) => {
      res.send(
        bounties.sort(
          (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
        )
      );
    });
  })
);

router.get(
  "/me",
  ...authHandlers(async (req, res) => {
    const { email: me } = req.tokenPayload;
    bountiesCollection
      .find({
        $or: [
          {
            $and: [
              { type: "bounty" },
              {
                $or: [
                  { "primaryAdmin.email": me },
                  { "secondaryAdmin.eamil": me },
                ]
              }
            ]
          },
          {
            $and: [
              { type: "concept" },
              { "user.email": me },
            ]
          }
        ]
      })
      .toArray((err, bounties) => {
        res.send(
          bounties.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        );
      })
  })
)

router.put(
  "/comment/:id",
  ...authHandlers(async (req, res) => {
    const commentID = new ObjectID();

    const bounty = await bountiesCollection.findOne({
      _id: ObjectID(req.params.id),
    });

    const pattern = /\B@[a-z0-9_-]+/gi;
    const mentionedArray = req.body.comment.match(pattern);
    if (mentionedArray && mentionedArray.length > 0) {
      const mentionedUsers = await Promise.all(
        mentionedArray.map(async (result) => {
          const data = await usersCollection.findOne({
            username: result.replace("@", ""),
          });
          return data;
        })
      );
      await Promise.all(
        mentionedUsers.map(async (user) => {
          await notificationsCollection.insertOne({
            notificationLevel: "bounty",
            notificationType: "mentionBounty",
            sourceUser: req.body.commentUser,
            destinationUser: user,
            comment: req.body.comment,
            commentID: commentID,
            bountyTitle: bounty.title,
            bountyType: bounty.bountyType,
            bountyDisplayURL: bounty.displayURL,
            bountyID: ObjectID(bounty._id),
            date: new Date(),
          });
        })
      );
    }
    await activityCollection.insertOne({
      activityLevel: "bounty",
      activityType: "commentBounty",
      bountyTitle: bounty.title,
      bountyType: bounty.bountyType,
      bountyDisplayURL: bounty.displayURL,
      sourceUser: req.body.commentUser,
      comment: req.body.comment,
      commentID: commentID,
      destinationUser: bounty.approvedBy,
      bountyID: ObjectID(bounty._id),
      date: new Date(),
    });
    res.send({ message: "success" });
  })
);

router.put(
  "/comment-edit/:id",
  ...authHandlers(async (req, res) => {
    await notificationsCollection.updateMany(
      { commentID: ObjectId(req.params.id) },
      { $set: { comment: req.body.comment } }
    );
    await activityCollection.updateMany(
      { commentID: ObjectId(req.params.id) },
      { $set: { comment: req.body.comment } }
    );
    res.send({ message: "success" });
  })
);

router.get(
  "/get/:id/activity",
  ...authHandlers(async (req, res) => {
    const result = await activityCollection
      .find({
        $or: [
          { bountyID: ObjectID(req.params.id), activityLevel: "task" },
          { bountyID: ObjectID(req.params.id), activityLevel: "bounty" },
        ],
      })
      .toArray();
    res.send(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
  })
);

router.put(
  "/comment/:id/last-seen",
  ...authHandlers(async (req, res) => {
    // Read out comments
    try {
      await activityCollection.updateMany(
        {
          $or: [
            {bountyID: ObjectID(req.params.id), activityLevel: "task"},
            {bountyID: ObjectID(req.params.id), activityLevel: "bounty"},
          ]
        },
        {$set: {lastViewedAt: new Date()}}
      );

      res.send({message: "success"});
    } catch (e) {
      res.status(500).send({message: e.message});
    }
  })
);

router.get(
  "/concepts/public",
  ...authHandlers(async (req, res) => {
    bountiesCollection
      .find({ type: "concept", status: "review" })
      .project({ user: 1, title: 1, displayURL: 1, dateCreated: 1 })
      .toArray((err, bounties) => {
        res.send(
          bounties.sort(
            (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
          )
        );
      });
  })
);

router.get(
  "/concepts/all",
  ...authHandlers(async (req, res) => {
    bountiesCollection
      .aggregate([
        { $match: { type: "concept" } },
        {
          $lookup: {
            from: "activity",
            localField: "_id",
            foreignField: "bountyID",
            as: "comments",
          },
        },
        {
          $project: {
            user: 1,
            title: 1,
            displayURL: 1,
            dateCreated: 1,
            status: 1,
            valueProposition: 1,
            comments: 1,
          },
        },
      ])
      .toArray((err, bounties) => {
        res.send(
          bounties.sort(
            (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
          ).map((bounty) => ({
            ...bounty,
            comments: bounty.comments
              .filter(comment => ["task", "bounty"].includes(comment.activityLevel) && comment.activityType === "commentBounty")
              .sort((a, b) => new Date(b.date) - new Date(a.date))
          }))
        );
      });
  })
);

router.get(
  "/bounty/:url",
  ...authHandlers(async (req, res) => {
    const bounty = await bountiesCollection.findOne({
      displayURL: req.params.url,
    });
    if (!bounty) {
      res.send({ error: "Bounty not found" });
    } else {
      const tasks = await tasksCollection
        .find({ bountyID: bounty._id })
        .toArray();
      bounty.tasks = tasks;
      res.send(bounty);
    }
  })
);

router.post(
  "/new",
  ...authHandlers(async (req, res) => {
    const bounty = await bountiesCollection.insertOne({ ...req.body });
    res.send({ message: "success" });
    await activityCollection.insertOne({
      activityLevel: "bounty",
      activityType: "newConcept",
      bountyTitle: req.body.title,
      bountyDisplayURL: req.body.displayURL,
      sourceUser: req.body.user,
      bountyID: ObjectID(bounty.ops[0]._id),
      date: new Date(),
    });
  })
);

router.put(
  "/update",
  ...authHandlers(async (req, res) => {
    if (!req.tokenPayload.isAdmin) {
      res.send({ error: "Insufficient permissions" });
    } else {
      const newData = { ...req.body };
      delete newData._id;
      const bounty = await bountiesCollection.findOneAndUpdate(
        { _id: ObjectID(req.body._id) },
        { $set: { ...newData } },
        { returnOriginal: true }
      );
      if (req.body.type === "bounty" && bounty.value.type === "concept") {
        await notificationsCollection.insertOne({
          notificationLevel: "bounty",
          notificationType: "approveConcept",
          bountyTitle: bounty.value.title,
          bountyType: bounty.bountyType,
          bountyDisplayURL: bounty.value.displayURL,
          sourceUser: req.body.approvedBy,
          destinationUser: bounty.value.user,
          bountyID: ObjectID(bounty.value._id),
          date: new Date(),
        });
        await activityCollection.insertOne({
          activityLevel: "bounty",
          activityType: "approveConcept",
          bountyTitle: bounty.value.title,
          bountyDisplayURL: bounty.value.displayURL,
          bountyType: bounty.bountyType,
          sourceUser: req.body.approvedBy,
          destinationUser: bounty.value.user,
          bountyID: ObjectID(bounty.value._id),
          date: new Date(),
        });
      }
      res.send({ message: "success" });
    }
  })
);

module.exports = router;
