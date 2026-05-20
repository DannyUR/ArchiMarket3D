<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPaypalOrderIdToShoppingTable extends Migration
{
    public function up()
    {
        Schema::table('shopping', function (Blueprint $table) {
            $table->string('paypal_order_id')->nullable()->after('payment_id');
            $table->timestamp('paid_at')->nullable()->after('paypal_order_id');
        });
    }

    public function down()
    {
        Schema::table('shopping', function (Blueprint $table) {
            $table->dropColumn(['paypal_order_id', 'paid_at']);
        });
    }
}