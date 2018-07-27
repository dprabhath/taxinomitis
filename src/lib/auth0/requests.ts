// external dependencies
import * as request from 'request-promise';
// local dependencies
import * as Objects from './auth-types';
import * as env from '../utils/env';

// NO LOGIC IN HERE!
//  PUTTING ONLY XHR REQUESTS IN ONE PLACE MAKES IT EASIER TO STUB OUT AUTH0 FOR TEST PURPOSES
//  ANYTHING THAT LOOKS LIKE APP LOGIC SHOULDN'T GO IN HERE AS IT WON'T BE TESTED AS MUCH


export function getOauthToken() {
    const options = {
        method: 'POST',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/oauth/token',
        headers: { 'content-type': 'application/json' },
        json : true,
        body: {
            client_id : process.env[env.AUTH0_API_CLIENTID],
            client_secret : process.env[env.AUTH0_API_CLIENTSECRET],
            audience : 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/',
            grant_type : 'client_credentials',
        },
    };

    return request.post(options);
}

export async function getUser(token: string, userid: string): Promise<Objects.User> {
    const getoptions = {
        method: 'GET',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users/' + userid,
        headers: {
            authorization : 'Bearer ' + token,
        },
        qs : {
            fields : 'user_id,username,app_metadata',
        },
        json : true,
    };

    const user = await request.get(getoptions);
    return user;
}


/**
 * Returns the registered teacher for the specified class.
 *  If there is more than one supervisor for a class, only the
 *  first user account returned by Auth0 will be returned.
 */
export async function getSupervisor(token: string, tenant: string): Promise<Objects.SupervisorInfo | undefined> {
    const getoptions = {
        method: 'GET',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users',
        headers: {
            authorization : 'Bearer ' + token,
        },
        qs : {
            q : 'app_metadata.role:"supervisor" AND app_metadata.tenant:"' + tenant + '"',
            per_page : 1,

            search_engine : 'v3',
        },
        json : true,
    };

    return request.get(getoptions)
        .then((users) => {
            if (users.length > 0) {
                return users[0];
            }
        });
}


export async function getSupervisors(
    token: string,
    batch: number, batchsize: number,
): Promise<{ total: number, users: Objects.User[]}>
{
    const getoptions = {
        method: 'GET',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users',
        headers: {
            authorization : 'Bearer ' + token,
        },
        qs : {
            q : 'app_metadata.role:"supervisor"',
            include_totals : true,

            page: batch,
            per_page : batchsize,

            search_engine : 'v3',
        },
        json : true,
    };

    const response = await request.get(getoptions);
    return {
        users : response.users,
        total : response.total,
    };
}

export async function getUsers(token: string, tenant: string): Promise<Objects.User[]> {
    const getoptions = {
        method: 'GET',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users',
        headers: {
            authorization : 'Bearer ' + token,
        },
        qs : {
            q : 'app_metadata.role:"student" AND app_metadata.tenant:"' + tenant + '"',
            per_page : 100,

            search_engine : 'v3',
        },
        json : true,
    };

    const users = await request.get(getoptions);
    return users;
}


export async function getClassSupervisors(token: string, tenant: string): Promise<Objects.SupervisorInfo[]> {
    const getoptions = {
        method: 'GET',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users',
        headers: {
            authorization : 'Bearer ' + token,
        },
        qs : {
            q : 'app_metadata.role:"supervisor" AND app_metadata.tenant:"' + tenant + '"',
            per_page : 100,

            search_engine : 'v3',
        },
        json : true,
    };

    const users = await request.get(getoptions);
    return users;
}



export async function getUserCounts(token: string, tenant: string): Promise<Objects.UsersInfo> {
    const getoptions = {
        method: 'GET',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users',
        headers: {
            authorization : 'Bearer ' + token,
        },
        qs : {
            q : 'app_metadata.tenant:"' + tenant + '"',
            fields : 'id',
            include_fields : true,
            include_totals : true,

            search_engine : 'v3',
        },
        json : true,
    };

    const usersInfo = await request.get(getoptions);
    return usersInfo;
}



export function createUser(token: string, newuser: Objects.NewUser) {
    const createoptions = {
        method: 'POST',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users',
        headers: {
            authorization : 'Bearer ' + token,
        },
        body : newuser,
        json : true,
    };

    return request.post(createoptions);
}


export function deleteUser(token: string, userid: string) {
    const deleteoptions = {
        method: 'DELETE',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users/' + userid,
        headers: {
            authorization : 'Bearer ' + token,
        },
    };

    return request.delete(deleteoptions);
}

export function modifyUser(token: string, userid: string, modifications: Objects.Modifications) {
    const modifyoptions = {
        method: 'PATCH',
        url: 'https://' + process.env[env.AUTH0_DOMAIN] + '/api/v2/users/' + userid,
        headers: {
            authorization : 'Bearer ' + token,
        },
        body : modifications,
        json : true,
    };

    return request.patch(modifyoptions);
}

