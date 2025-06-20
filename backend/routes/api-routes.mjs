import path from "path";
import { Router } from "express";
import { fileURLToPath } from "url";

import { googleLogin } from "../route-handlers/googleApi.mjs";
import { githubLogin, isAuthWithGithub, githubLogout } from "../route-handlers/github-auth.mjs";
import { verifyToken, belongsToGroups, verifyCookieOrElse } from "../route-handlers/auth.mjs";
import { updateSlides } from "../route-handlers/info-screen.mjs";
import { getInvoiceData, getInvoice, createInvoice, createTempInvoice, addCustomer, deleteCustomer } from "../route-handlers/invoice.mjs";
import { newsfeed, addReaction, deleteReaction, addComment, editComment, deleteComment } from "../route-handlers/newsfeed.mjs";
import { getPhotos } from "../route-handlers/photos.mjs";
import { getSlides } from "../route-handlers/info-screen.mjs";
import { photoHostPost, getUserPhotos, deleteUserPhoto, uploadMedia } from "../route-handlers/photo-host.mjs";
import { getBoardProtocols } from "../route-handlers/protocols.mjs";
import { getKickOffEvents, getDVEvents } from "../route-handlers/events.mjs";
import { getWeather } from "../route-handlers/weather.mjs";
import { compileProtocol } from "../helpers/protocols-compile.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = Router();

router.post("/api/verify-token", verifyToken, (req, res) => res.status(200).json({ ok: "ok" }));

router.post("/api/google-auth", googleLogin);

router.get("/api/github-auth", githubLogin);
router.post("/api/github-auth", isAuthWithGithub);
router.post("/api/github-auth/logout", githubLogout);

router.get("/api/wiki-data", (req, res) => verifyCookieOrElse(req, res,
    // Ok
    (req, res) => {
        res.set("Content-Type", "application/javascript");
        res.set("Content-Encoding", "gzip");
        res.sendFile(path.resolve(__dirname, "../../frontend/dist-secret/secretWiki.js.gz"));
    },
    // Or else
    (req, res) => {
        res.set("Content-Type", "application/javascript");
        res.set("Content-Encoding", "gzip");
        res.sendFile(path.resolve(__dirname, "../../frontend/dist-secret/wiki.js.gz"));
    })
);

router.get("/api/styrelsen/invoice-data", belongsToGroups(["firmatecknare", "dv_ops"]), getInvoiceData);
router.get("/api/styrelsen/invoice/:invoice", belongsToGroups(["firmatecknare", "dv_ops"]), getInvoice);
router.post("/api/styrelsen/invoice", belongsToGroups(["firmatecknare", "dv_ops"]), createInvoice);
router.post("/api/styrelsen/invoice/createPreview", belongsToGroups(["firmatecknare", "dv_ops"]), createTempInvoice);
router.post("/api/styrelsen/invoice/add-customer", belongsToGroups(["firmatecknare", "dv_ops"]), addCustomer);
router.delete("/api/styrelsen/invoice/delete-customer/:customer", belongsToGroups(["firmatecknare", "dv_ops"]), deleteCustomer);

router.get("/api/newsfeed", newsfeed);
router.post("/api/newsfeed/:postId/react", addReaction);
router.delete("/api/newsfeed/:postId/react/:reactionId", deleteReaction);
router.post("/api/newsfeed/:postId/comment", addComment);
router.put("/api/newsfeed/:postId/comment/:commentId", editComment);
router.delete("/api/newsfeed/:postId/comment/:commentId", deleteComment);

router.get("/api/info-screen", getSlides);
router.put("/api/info-screen/update", verifyToken, updateSlides);

router.get("/api/photos", getPhotos);
router.post("/api/photos/post", verifyToken, uploadMedia, photoHostPost);
router.get("/api/user/photos", verifyToken, getUserPhotos);
router.delete("/api/user/photos/:hash", verifyToken, deleteUserPhoto);

router.get("/api/protocols", getBoardProtocols);
router.post("/api/protocols/pdf", compileProtocol);

router.get("/api/kickoff-events", getKickOffEvents);
router.get("/api/events", getDVEvents);

router.get("/api/weather", getWeather);

export default router;