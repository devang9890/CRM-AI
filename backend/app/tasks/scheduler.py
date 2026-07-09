from apscheduler.schedulers.background import BackgroundScheduler

from app.tasks.gmail_sync_task import sync_all_users

scheduler = BackgroundScheduler(timezone="UTC")


def start_scheduler():
    scheduler.add_job(
        sync_all_users,
        trigger="interval",
        minutes=5,
        id="gmail_sync",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()