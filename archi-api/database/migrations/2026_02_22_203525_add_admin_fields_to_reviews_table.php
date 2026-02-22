<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('comment');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->text('admin_reply')->nullable()->after('rejected_at');
            $table->timestamp('replied_at')->nullable()->after('admin_reply');
            $table->unsignedBigInteger('replied_by')->nullable()->after('replied_at');
            $table->boolean('reported')->default(false)->after('replied_by');
        });
    }

    public function down()
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn([
                'approved_at',
                'rejected_at',
                'admin_reply',
                'replied_at',
                'replied_by',
                'reported'
            ]);
        });
    }
};