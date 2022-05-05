'use strict';
const Issue = require('../models');


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let query = req.query;


      
      const queryDocs = {project};
      for (let key in query) {
        queryDocs[key] = query[key];
      }
      
      Issue.find(queryDocs, function(err, docs) {
        const projectIssues = docs.map(item => ({
            "assigned_to":item.assigned_to,
            "status_text":item.status_text,
            "open":item.open,
            "_id":item._id,
            "issue_title":item.issue_title,
            "issue_text":item.issue_text,
            "created_by":item.created_by,
            "created_on":item.created_on,
            "updated_on":item.updated_on
          })
        );
        res.json(projectIssues);
      });

    })
    
    .post(async function (req, res){
      let project = req.params.project;
      // console.log("post", project);
      const {issue_title, issue_text, created_by} = req.body;
      // console.log(req.body)
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' });
      } else {
        let issueData = Object.assign(req.body, {project});
        let {assigned_to, status_text} = req.body;
        
        if (!assigned_to) {
          assigned_to = "";
          issueData = {
            ...issueData,
            assigned_to
          }
        }
        if (!status_text) {
          status_text = "";
          issueData = {
            ...issueData,
            status_text
          }
        }
        
        const issue = new Issue(issueData);
        
        try {
          await issue.save();
        
          res.json({
            assigned_to: issue.assigned_to,
            status_text: issue.status_text,
            open: issue.open,
            _id: issue._id,
            issue_title: issue.issue_title,
            issue_text: issue.issue_text,
            created_by: issue.created_by,
            created_on: issue.created_on,
            updated_on: issue.updated_on
          });
        } catch (error) {
          res.status(500).send(error);
        } 
      }
    })
    
    .put(function (req, res){
      let project = req.params.project;
      // console.log(req.body, project);
      const { issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body;
      
      const updateIssue = {};
      for (let key in req.body) {
        if (key !== '_id' && req.body[key] !== '') {
          updateIssue[key] = req.body[key]
        }
      }
      updateIssue['updated_on'] = Date.now();

      // console.log(updateIssue);

      if (req.body._id) {
        if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
          res.json({ error: 'no update field(s) sent', '_id': req.body._id });
        } else {
          Issue.findOneAndUpdate({_id: req.body._id}, updateIssue,
          function(err, doc) {
            // console.log(req.body, updateIssue, doc)
            if (err || !doc) {
              res.json({ error: 'could not update', '_id': req.body._id })
            } else {
              res.json({  result: 'successfully updated', '_id': String(doc._id) });
            }
          });
        }
      } else {
        res.json({ error: 'missing _id' })
      }

    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const {_id} = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
      } else {
        Issue.findOneAndDelete({_id}, function(err, doc) {
          if (err || !doc) {
            res.json({error: 'could not delete', '_id': _id});
          } else {
            res.json({result: 'successfully deleted', '_id': _id});
          }
        });
      }
    });
    
};
