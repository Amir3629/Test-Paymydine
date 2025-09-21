<?php

namespace Admin\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class NotificationsApi extends BaseController
{
    // GET /admin/api/notifications?status=new|all&limit=20
    public function index(Request $request)
    {
        $status = $request->query('status', 'new');
        $limit  = (int)$request->query('limit', 20);

        $q = DB::table('notifications')->orderByDesc('created_at'); // no prefix here
        if ($status === 'new') $q->where('status', 'new');

        $items = $q->limit($limit)->get([
            'id','type','title','table_id','table_name','payload','status','created_at'
        ]);

        return Response::json(['ok'=>true,'items'=>$items], 200);
    }

    // GET /admin/api/notifications/count
    public function count()
    {
        $new = DB::table('notifications')->where('status', 'new')->count();
        return Response::json(['ok'=>true,'new'=>$new], 200);
    }

    // PATCH /admin/api/notifications/{id}   {status: seen|in_progress|resolved}
    public function update($id, Request $request)
    {
        $data = $request->validate([
            'status' => 'required|in:seen,in_progress,resolved'
        ]);

        DB::table('notifications')->where('id', $id)->update([
            'status' => $data['status'],
            'updated_at' => now(),
        ]);

        return Response::json(['ok'=>true,'id'=>(int)$id,'status'=>$data['status']], 200);
    }

    // PATCH /admin/api/notifications/mark-all-seen
    public function markAllSeen()
    {
        DB::table('notifications')->where('status', 'new')->update([
            'status' => 'seen',
            'updated_at' => now(),
        ]);

        return Response::json(['ok'=>true], 200);
    }
}