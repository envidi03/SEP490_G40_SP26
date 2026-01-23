const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get a list of rooms with optional filters
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by room number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by room status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort by room number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Rooms retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6971de975524e37b724498d7"
 *                       room_number:
 *                         type: string
 *                         example: "room 101"
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *                       clinic_id:
 *                         type: string
 *                         example: "696edbf3b3f056e62cee450c"
 *                       note:
 *                         type: string
 *                         example: "room 101"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     size:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 4
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 */

router.get('/', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.getRooms);

module.exports = router;