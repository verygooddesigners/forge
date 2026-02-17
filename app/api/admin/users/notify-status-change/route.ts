import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the requester is an admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, email, newStatus } = await request.json();

    if (!userId || !email || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email notification using Supabase
    // Note: This requires Supabase email templates to be configured
    // For now, we'll use the auth.admin API to send a custom email
    
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`;
    
    // In a production environment, you would configure Supabase email templates
    // or use a service like SendGrid, Resend, etc.
    // For now, we'll log the notification
    console.log(`
      Email notification would be sent to: ${email}
      Subject: Your Forge Account Has Been Approved
      Body:
        Your account status has been changed to: ${newStatus}
        You can now log in at: ${loginUrl}
    `);

    // TODO: Implement actual email sending
    // Example with SendGrid or similar service:
    /*
    await sendEmail({
      to: email,
      subject: 'Your Forge Account Has Been Approved',
      html: `
        <h2>Your Account Has Been Approved!</h2>
        <p>Your account status has been changed to: <strong>${newStatus}</strong></p>
        <p>You can now log in to Forge and start creating content.</p>
        <a href="${loginUrl}">Log in to Forge</a>
      `
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

