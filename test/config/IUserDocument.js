"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.UserDocumentMock = void 0;
const mongoose_1 = require("mongoose");
class UserDocumentMock {
    name;
    email;
    subdocs;
    collection;
    toJSON(options) {
        return this.collection.model.toJSON(this, options);
    }
}
exports.UserDocumentMock = UserDocumentMock;
exports.UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subdocs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Subdoc' }],
});
//# sourceMappingURL=IUserDocument.js.map