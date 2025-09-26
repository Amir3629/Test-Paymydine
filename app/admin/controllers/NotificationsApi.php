<?php

namespace Admin\Controllers;

use Illuminate\Routing\Controller;
use Admin\Models\Notifications_model;
use Illuminate\Http\Request;

class NotificationsApi extends Controller
{
    public function count()
    {
        try {
            $new = Notifications_model::where('is_read', 0)->count(); // adjust column if different
            return response()->json(['ok' => true, 'new' => $new]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        try {
            $notifications = Notifications_model::orderBy('created_at', 'desc')->get();
            return response()->json(['ok' => true, 'data' => $notifications]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $notification = Notifications_model::findOrFail($id);
            $notification->update($request->all());
            return response()->json(['ok' => true, 'data' => $notification]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function markAllSeen()
    {
        try {
            Notifications_model::where('is_read', 0)->update(['is_read' => 1]);
            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }
}