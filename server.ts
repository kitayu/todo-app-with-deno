import { serve } from 'http/server.ts';
import { match, MatchResult } from 'https://deno.land/x/path_to_regexp@v6.2.0/index.ts';
import { Todo } from './todo.ts'

// url定義
const getPath = '/todo/:id(\\d)';
const postPath = '/todo';
const now = new Date();

const data = new Map<string, Todo>();
data.set('1', { id: '1', name: 'タスク1', status: 'Done', createAt: now.toISOString(), updateAt: now.toISOString() });
data.set('2', { id: '2', name: 'タスク2', status: 'Waiting', createAt: now.toISOString(), updateAt: now.toISOString() });

async function handler(request: Request): Promise<Response> {
	const url = new URL(request.url);

	let urlMatch;
	let matchResult;
	let response: Response = new Response(undefined, { status: 404 })
	if (request.method === 'GET') {
		urlMatch = match<Todo>(getPath);
		matchResult = <MatchResult<Todo>>urlMatch(url.pathname);
		if (matchResult) {
			response = getTodoHandler(matchResult);
		}
	} else if (request.method === 'POST') {
		urlMatch = match(postPath);
		matchResult = <MatchResult>urlMatch(url.pathname);
		if (matchResult) {
			const body = await request.text();
			response = postTodoHandler(body);
		}

	}

	return response;
}

function getTodoHandler(matchResult: MatchResult<Todo>): Response {
	if (!matchResult.params.id) {
		return new Response(undefined, { status: 400 });
	}
	const todo = data.get(matchResult.params.id);
	if (todo) {
		const body = JSON.stringify(todo);
		return new Response(body, { status: 200 });
	}

	return new Response(undefined, { status: 404 });
}

function postTodoHandler(body: string): Response {
	console.log('ok')
	const todo = JSON.parse(body) as Todo;
	const date = new Date;
	todo.createAt = date.toISOString();
	todo.updateAt = date.toISOString();
	todo.id = (data.size + 1).toString();
	data.set(todo.id, todo);

	return new Response(undefined, { status: 200 })
}

await serve(handler, { port: 8080 });
