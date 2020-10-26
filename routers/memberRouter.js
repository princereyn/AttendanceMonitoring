const express = require('express');
const memberController = require('../controllers/memberController');

const router = express.Router();

router.get('/search', memberController.searchMembersValidator, memberController.searchMembers);
router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getByMemberIdValidator, memberController.getByMemberId);
router.post('/', memberController.insertMemberValidator, memberController.insertMember);
router.put('/', memberController.updateMemberValidator, memberController.updateMember);
router.delete('/', memberController.deleteMemberValidator, memberController.deleteMember);

module.exports = router;
