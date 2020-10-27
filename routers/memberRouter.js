const express = require('express');
const memberController = require('../controllers/memberController');

const router = express.Router();

router.get('/search', memberController.searchMembersValidator, memberController.searchMembers);
router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getByMemberIdValidator, memberController.getByMemberId);
router.post('/', memberController.insertMemberValidator, memberController.insertMember);
router.put('/:id', memberController.updateMemberValidator, memberController.updateMember);
router.delete('/:id', memberController.deleteMemberValidator, memberController.deleteMember);

module.exports = router;
