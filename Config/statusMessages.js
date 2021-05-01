'use strict';

let STATUS_MSG = {
    ERROR: {
        INSERT_FAIL: 'Insertion fail',
        NOT_FOUND: 'DATA NOT FOUND',
        INVALID_REQUEST: 'INVALID Post/Comment Id'
    },
    SUCCESS: {
        FETCH_DATA: 'Data fetched successfully',
        CREATE_POST: 'Post Added Successfully',
        CREATE_COMMENT: 'Comment Added Successfully'
    }
};

module.exports = STATUS_MSG;
