import { Router } from "express";
import container from "../config/dependency-injection";
import {
  changeDates,
  changeSeats,
  organizeConference,
  reserveSeats,
} from "../controllers/conference.controllers";
import { isAuthenticated } from "../middlewares/authentication.middleware";

const router = Router();

router.use(isAuthenticated);
router.post("/conference", organizeConference(container));
router.patch("/conference/seats/:id", changeSeats(container));
router.patch("/conference/dates/:id", changeDates(container));
router.post("/conference/book/:id", reserveSeats);

export default router;
