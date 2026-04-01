import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const { email, plan = 'testing_plan', secret } = await req.json();

        // 1. Authorization Check
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret || secret !== adminSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 2. Determine Subscription Details
        let startDate = new Date();
        let endDate = null;
        let status = 'active';

        if (plan === 'testing_plan') {
            endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 100)); // 100 years
        } else if (plan === 'pro_yearly') {
            endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        } else if (plan === 'pro_monthly') {
            endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
        } else {
            return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        // 3. Update User
        const user = await prisma.user.update({
            where: { email },
            data: {
                plan,
                subscriptionStatus: status,
                subscriptionStartDate: startDate,
                subscriptionEndDate: endDate,
                paymentProvider: 'manual_admin',
            },
        });

        return NextResponse.json({
            success: true,
            message: `Successfully upgraded ${user.email} to ${plan}`,
            user
        });

    } catch (error) {
        console.error('Admin grant access error:', error);
        return NextResponse.json(
            { error: 'Failed to grant access', details: error.message },
            { status: 500 }
        );
    }
}
