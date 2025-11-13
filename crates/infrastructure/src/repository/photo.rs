use async_trait::async_trait;
use domain::entity::photo::{ActiveModel as PhotoActiveModel, Column as PhotoColumn, Entity as Photo, Model as PhotoModel};
use domain::entity::photo_exif::{ActiveModel as PhotoExifActiveModel, Column as PhotoExifColumn, Entity as PhotoExif, Model as PhotoExifModel};
use domain::repository::{PhotoRepository, PhotoExifRepository};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter,
    QueryOrder, QuerySelect, Set, TransactionTrait,
};

// ==================== PhotoRepositoryImpl ====================

pub struct PhotoRepositoryImpl {
    db: DatabaseConnection,
}

impl PhotoRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl PhotoRepository for PhotoRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<PhotoModel>> {
        let photo = Photo::find_by_id(id)
            .filter(PhotoColumn::IsDeleted.eq(false))
            .one(&self.db)
            .await?;
        Ok(photo)
    }

    async fn find_by_id_with_exif(&self, id: i32) -> anyhow::Result<Option<(PhotoModel, Option<PhotoExifModel>)>> {
        let photo = Photo::find_by_id(id)
            .filter(PhotoColumn::IsDeleted.eq(false))
            .one(&self.db)
            .await?;

        if let Some(photo) = photo {
            let exif = PhotoExif::find()
                .filter(PhotoExifColumn::PhotoId.eq(id))
                .one(&self.db)
                .await?;
            Ok(Some((photo, exif)))
        } else {
            Ok(None)
        }
    }

    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>> {
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        let photos = Photo::find()
            .filter(PhotoColumn::IsDeleted.eq(false))
            .order_by_desc(PhotoColumn::CreateTime)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if photos.is_empty() {
            Ok(None)
        } else {
            Ok(Some(photos))
        }
    }

    async fn find_by_media_library_id_paged(
        &self,
        media_library_id: i32,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>> {
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        let photos = Photo::find()
            .filter(PhotoColumn::MediaLibraryId.eq(media_library_id))
            .filter(PhotoColumn::IsDeleted.eq(false))
            .order_by_desc(PhotoColumn::CreateTime)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if photos.is_empty() {
            Ok(None)
        } else {
            Ok(Some(photos))
        }
    }

    async fn find_favorites_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>> {
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        let photos = Photo::find()
            .filter(PhotoColumn::IsFavorite.eq(true))
            .filter(PhotoColumn::IsDeleted.eq(false))
            .order_by_desc(PhotoColumn::CreateTime)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if photos.is_empty() {
            Ok(None)
        } else {
            Ok(Some(photos))
        }
    }

    async fn find_by_tag(
        &self,
        tag: &str,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<PhotoModel>>> {
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        // 使用 LIKE 查询标签
        let search_pattern = format!("%{}%", tag);
        let photos = Photo::find()
            .filter(PhotoColumn::Tags.like(&search_pattern))
            .filter(PhotoColumn::IsDeleted.eq(false))
            .order_by_desc(PhotoColumn::CreateTime)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        if photos.is_empty() {
            Ok(None)
        } else {
            Ok(Some(photos))
        }
    }

    async fn create(&self, photo: PhotoModel) -> anyhow::Result<PhotoModel> {
        let active_model = PhotoActiveModel {
            id: sea_orm::NotSet,
            create_time: Set(photo.create_time),
            update_time: Set(photo.update_time),
            path: Set(photo.path),
            byte_size: Set(photo.byte_size),
            resolution: Set(photo.resolution),
            extension: Set(photo.extension),
            width: Set(photo.width),
            height: Set(photo.height),
            thumbnail_path: Set(photo.thumbnail_path),
            hash: Set(photo.hash),
            is_deleted: Set(photo.is_deleted),
            is_favorite: Set(photo.is_favorite),
            tags: Set(photo.tags),
            media_library_id: Set(photo.media_library_id),
        };

        let result = active_model.insert(&self.db).await?;
        Ok(result)
    }

    async fn create_batch(&self, photos: Vec<PhotoModel>) -> anyhow::Result<Vec<PhotoModel>> {
        let txn = self.db.begin().await?;
        let mut results = Vec::new();

        for photo in photos {
            let active_model = PhotoActiveModel {
                id: sea_orm::NotSet,
                create_time: Set(photo.create_time),
                update_time: Set(photo.update_time),
                path: Set(photo.path),
                byte_size: Set(photo.byte_size),
                resolution: Set(photo.resolution),
                extension: Set(photo.extension),
                width: Set(photo.width),
                height: Set(photo.height),
                thumbnail_path: Set(photo.thumbnail_path),
                hash: Set(photo.hash),
                is_deleted: Set(photo.is_deleted),
                is_favorite: Set(photo.is_favorite),
                tags: Set(photo.tags),
                media_library_id: Set(photo.media_library_id),
            };

            let result = active_model.insert(&txn).await?;
            results.push(result);
        }

        txn.commit().await?;
        Ok(results)
    }

    async fn update(&self, photo: PhotoModel) -> anyhow::Result<PhotoModel> {
        let active_model = PhotoActiveModel {
            id: Set(photo.id),
            create_time: Set(photo.create_time),
            update_time: Set(photo.update_time),
            path: Set(photo.path),
            byte_size: Set(photo.byte_size),
            resolution: Set(photo.resolution),
            extension: Set(photo.extension),
            width: Set(photo.width),
            height: Set(photo.height),
            thumbnail_path: Set(photo.thumbnail_path),
            hash: Set(photo.hash),
            is_deleted: Set(photo.is_deleted),
            is_favorite: Set(photo.is_favorite),
            tags: Set(photo.tags),
            media_library_id: Set(photo.media_library_id),
        };

        let result = active_model.update(&self.db).await?;
        Ok(result)
    }

    async fn update_batch(&self, photos: Vec<PhotoModel>) -> anyhow::Result<Vec<PhotoModel>> {
        let txn = self.db.begin().await?;
        let mut results = Vec::new();

        for photo in photos {
            let active_model = PhotoActiveModel {
                id: Set(photo.id),
                create_time: Set(photo.create_time),
                update_time: Set(photo.update_time),
                path: Set(photo.path),
                byte_size: Set(photo.byte_size),
                resolution: Set(photo.resolution),
                extension: Set(photo.extension),
                width: Set(photo.width),
                height: Set(photo.height),
                thumbnail_path: Set(photo.thumbnail_path),
                hash: Set(photo.hash),
                is_deleted: Set(photo.is_deleted),
                is_favorite: Set(photo.is_favorite),
                tags: Set(photo.tags),
                media_library_id: Set(photo.media_library_id),
            };

            let result = active_model.update(&txn).await?;
            results.push(result);
        }

        txn.commit().await?;
        Ok(results)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        // 软删除：只标记为已删除
        let photo = Photo::find_by_id(id).one(&self.db).await?;
        if let Some(photo) = photo {
            let mut active_model: PhotoActiveModel = photo.into();
            active_model.is_deleted = Set(true);
            active_model.update(&self.db).await?;
        }
        Ok(())
    }

    async fn delete_permanently(&self, id: i32) -> anyhow::Result<()> {
        // 永久删除
        Photo::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn count_all(&self) -> anyhow::Result<i32> {
        let count = Photo::find()
            .filter(PhotoColumn::IsDeleted.eq(false))
            .count(&self.db)
            .await? as i32;
        Ok(count)
    }

    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32> {
        let count = Photo::find()
            .filter(PhotoColumn::MediaLibraryId.eq(media_library_id))
            .filter(PhotoColumn::IsDeleted.eq(false))
            .count(&self.db)
            .await? as i32;
        Ok(count)
    }

    async fn find_by_hash(&self, hash: &str) -> anyhow::Result<Option<PhotoModel>> {
        let photo = Photo::find()
            .filter(PhotoColumn::Hash.eq(hash))
            .filter(PhotoColumn::IsDeleted.eq(false))
            .one(&self.db)
            .await?;
        Ok(photo)
    }

    async fn toggle_favorite(&self, id: i32) -> anyhow::Result<PhotoModel> {
        let photo = Photo::find_by_id(id).one(&self.db).await?;
        if let Some(photo) = photo {
            let mut active_model: PhotoActiveModel = photo.into();
            let current_favorite = active_model.is_favorite.clone().unwrap();
            active_model.is_favorite = Set(!current_favorite);
            let result = active_model.update(&self.db).await?;
            Ok(result)
        } else {
            Err(anyhow::anyhow!("Photo not found"))
        }
    }
}




// ==================== PhotoExifRepositoryImpl ====================

pub struct PhotoExifRepositoryImpl {
    db: DatabaseConnection,
}

impl PhotoExifRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl PhotoExifRepository for PhotoExifRepositoryImpl {
    async fn find_by_photo_id(&self, photo_id: i32) -> anyhow::Result<Option<PhotoExifModel>> {
        let exif = PhotoExif::find()
            .filter(PhotoExifColumn::PhotoId.eq(photo_id))
            .one(&self.db)
            .await?;
        Ok(exif)
    }

    async fn create(&self, exif: PhotoExifModel) -> anyhow::Result<PhotoExifModel> {
        let active_model = PhotoExifActiveModel {
            id: sea_orm::NotSet,
            photo_id: Set(exif.photo_id),
            camera_make: Set(exif.camera_make),
            camera_model: Set(exif.camera_model),
            software: Set(exif.software),
            f_number: Set(exif.f_number),
            exposure_time: Set(exif.exposure_time),
            iso_speed: Set(exif.iso_speed),
            focal_length: Set(exif.focal_length),
            focal_length_in_35mm: Set(exif.focal_length_in_35mm),
            exposure_program: Set(exif.exposure_program),
            exposure_mode: Set(exif.exposure_mode),
            metering_mode: Set(exif.metering_mode),
            white_balance: Set(exif.white_balance),
            flash: Set(exif.flash),
            scene_capture_type: Set(exif.scene_capture_type),
            date_time_original: Set(exif.date_time_original),
            gps_latitude: Set(exif.gps_latitude),
            gps_longitude: Set(exif.gps_longitude),
            gps_altitude: Set(exif.gps_altitude),
            image_width: Set(exif.image_width),
            image_height: Set(exif.image_height),
            orientation: Set(exif.orientation),
            color_space: Set(exif.color_space),
            resolution_unit: Set(exif.resolution_unit),
            x_resolution: Set(exif.x_resolution),
            y_resolution: Set(exif.y_resolution),
            has_gps: Set(exif.has_gps),
            has_thumbnail: Set(exif.has_thumbnail),
        };

        let result = active_model.insert(&self.db).await?;
        Ok(result)
    }

    async fn create_batch(&self, exifs: Vec<PhotoExifModel>) -> anyhow::Result<Vec<PhotoExifModel>> {
        let txn = self.db.begin().await?;
        let mut results = Vec::new();

        for exif in exifs {
            let active_model = PhotoExifActiveModel {
                id: sea_orm::NotSet,
                photo_id: Set(exif.photo_id),
                camera_make: Set(exif.camera_make),
                camera_model: Set(exif.camera_model),
                software: Set(exif.software),
                f_number: Set(exif.f_number),
                exposure_time: Set(exif.exposure_time),
                iso_speed: Set(exif.iso_speed),
                focal_length: Set(exif.focal_length),
                focal_length_in_35mm: Set(exif.focal_length_in_35mm),
                exposure_program: Set(exif.exposure_program),
                exposure_mode: Set(exif.exposure_mode),
                metering_mode: Set(exif.metering_mode),
                white_balance: Set(exif.white_balance),
                flash: Set(exif.flash),
                scene_capture_type: Set(exif.scene_capture_type),
                date_time_original: Set(exif.date_time_original),
                gps_latitude: Set(exif.gps_latitude),
                gps_longitude: Set(exif.gps_longitude),
                gps_altitude: Set(exif.gps_altitude),
                image_width: Set(exif.image_width),
                image_height: Set(exif.image_height),
                orientation: Set(exif.orientation),
                color_space: Set(exif.color_space),
                resolution_unit: Set(exif.resolution_unit),
                x_resolution: Set(exif.x_resolution),
                y_resolution: Set(exif.y_resolution),
                has_gps: Set(exif.has_gps),
                has_thumbnail: Set(exif.has_thumbnail),
            };

            let result = active_model.insert(&txn).await?;
            results.push(result);
        }

        txn.commit().await?;
        Ok(results)
    }

    async fn update(&self, exif: PhotoExifModel) -> anyhow::Result<PhotoExifModel> {
        let active_model = PhotoExifActiveModel {
            id: Set(exif.id),
            photo_id: Set(exif.photo_id),
            camera_make: Set(exif.camera_make),
            camera_model: Set(exif.camera_model),
            software: Set(exif.software),
            f_number: Set(exif.f_number),
            exposure_time: Set(exif.exposure_time),
            iso_speed: Set(exif.iso_speed),
            focal_length: Set(exif.focal_length),
            focal_length_in_35mm: Set(exif.focal_length_in_35mm),
            exposure_program: Set(exif.exposure_program),
            exposure_mode: Set(exif.exposure_mode),
            metering_mode: Set(exif.metering_mode),
            white_balance: Set(exif.white_balance),
            flash: Set(exif.flash),
            scene_capture_type: Set(exif.scene_capture_type),
            date_time_original: Set(exif.date_time_original),
            gps_latitude: Set(exif.gps_latitude),
            gps_longitude: Set(exif.gps_longitude),
            gps_altitude: Set(exif.gps_latitude),
            image_width: Set(exif.image_width),
            image_height: Set(exif.image_height),
            orientation: Set(exif.orientation),
            color_space: Set(exif.color_space),
            resolution_unit: Set(exif.resolution_unit),
            x_resolution: Set(exif.x_resolution),
            y_resolution: Set(exif.y_resolution),
            has_gps: Set(exif.has_gps),
            has_thumbnail: Set(exif.has_thumbnail),
        };

        let result = active_model.update(&self.db).await?;
        Ok(result)
    }

    async fn delete_by_photo_id(&self, photo_id: i32) -> anyhow::Result<()> {
        PhotoExif::delete_many()
            .filter(PhotoExifColumn::PhotoId.eq(photo_id))
            .exec(&self.db)
            .await?;
        Ok(())
    }
}
